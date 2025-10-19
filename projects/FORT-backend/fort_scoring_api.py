# pip install "uvicorn[standard]" fastapi numpy pandas pynacl python-dotenv py-algorand-sdk
# run: uvicorn fort_scoring_api:app --host 0.0.0.0 --port 8000
import os, time, json, base64, hashlib, glob
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from nacl.signing import SigningKey
from nacl.encoding import RawEncoder

load_dotenv()

# ---- Config ----
MODEL_PATH = os.environ.get("MODEL_PATH", "model/global_model.json")
DATA_DIR   = os.environ.get("DATA_DIR", "data")
AGG_SK_B64 = os.environ.get("AGG_SK_BASE64")           # 32B seed, base64
if not AGG_SK_B64:
    raise RuntimeError("Missing AGG_SK_BASE64 in .env")
AGG_SK = SigningKey(base64.b64decode(AGG_SK_B64), encoder=RawEncoder)
PREFIX = b"FORT|score|v1|"                              # keep in sync with contract

# ---- I/O helpers ----
def now_ts() -> int: return int(time.time())
def sha256(b: bytes) -> bytes: return hashlib.sha256(b).digest()
def sha256_hex(b: bytes) -> str: return hashlib.sha256(b).hexdigest()
def to_u64_be(n: int) -> bytes: return int(n).to_bytes(8, "big")
def hex32_to_bytes(h: str) -> bytes:
    h = h.lower().removeprefix("0x")
    b = bytes.fromhex(h)
    if len(b) != 32: raise ValueError("expected 32B hex")
    return b

# ---- Model loading ----
def load_model(path: str) -> Tuple[Dict[str, np.ndarray], Dict[str, Any]]:
    with open(path, "r") as f:
        obj = json.load(f)
    w = np.array(obj["weights"]["w"], dtype=float)
    b = float(obj["weights"]["b"])
    meta = obj
    # model_hash_hex: prefer precomputed, else hash weights deterministically
    if "model_hash" in obj:
        model_hash_hex = obj["model_hash"].lower().removeprefix("0x")
    else:
        mh = sha256_hex(json.dumps({"w": w.tolist(), "b": b}, sort_keys=True).encode())
        model_hash_hex = mh
    meta["_model_hash_hex"] = model_hash_hex
    return {"w": w, "b": b}, meta

# ---- Feature engineering (same as your notebook, compact) ----
def daily_series(df: pd.DataFrame, days: int = 90) -> pd.DataFrame:
    end = df["date"].max(); start = end - pd.Timedelta(days=days-1)
    rng = pd.date_range(start, end, freq="D")
    s = df.set_index("date")["amount"].groupby(pd.Grouper(freq="D")).sum().reindex(rng, fill_value=0.0)
    return pd.DataFrame({"date": rng, "amount": s.values})

def max_drawdown(x: np.ndarray) -> float:
    cum = x.cumsum(); peak = np.maximum.accumulate(cum)
    return float((peak - cum).max())

def periodicity_score(x: np.ndarray) -> float:
    def acf(v, lag):
        v1 = v[:-lag]; v2 = v[lag:]
        if v1.std() < 1e-8 or v2.std() < 1e-8: return 0.0
        return float(np.corrcoef(v1, v2)[0,1])
    return 0.0 if len(x) < 31 else max(0.0, max(acf(x, l) for l in [14,28,30]))

def shock_recovery(x: np.ndarray) -> float:
    if x.std() < 1e-8: return 1.0
    shock = -x.std(); bal = x.cumsum(); target = bal[-1]
    rec_bal = bal + shock
    steps = next((i+1 for i in range(len(rec_bal)) if rec_bal[i] >= target), len(rec_bal))
    return float(min(steps/len(rec_bal), 1.0))

def feature_vector(df: pd.DataFrame, window_days: int = 90) -> np.ndarray:
    ds = daily_series(df, days=window_days); x = ds["amount"].values.astype(float)
    inflow  = np.clip(x, 0, None); outflow = np.clip(-x, 0, None)
    feats = [
        inflow.mean(), inflow.std()+1e-6, outflow.mean(), outflow.std()+1e-6,
        inflow.mean()-outflow.mean(), (outflow.std()/(inflow.std()+1e-6)),
        max_drawdown(x),
        periodicity_score(inflow - outflow),
        shock_recovery(x),
        float(pd.Series(x).skew()), float(pd.Series(x).kurt())
    ]
    feats = np.array(feats, dtype=float)
    money_idx = [0,1,2,3,4,5,6]
    feats[money_idx] = np.sign(feats[money_idx]) * np.log1p(np.abs(feats[money_idx]))
    return feats

# ---- Scoring ----
def sigmoid(z): return 1.0/(1.0+np.exp(-z))
def predict_proba(W, X): return sigmoid(X @ W["w"] + W["b"])

def load_latest_client_csv(datadir: str) -> str:
    files = sorted(glob.glob(os.path.join(datadir, "client_*.csv")))
    if not files: raise FileNotFoundError("no client_*.csv in data/")
    return files[-1]  # highest index = latest

def score_csv(model: Dict[str, np.ndarray], csv_path: str) -> Tuple[float, int]:
    df = pd.read_csv(csv_path, parse_dates=["date"]).sort_values("date")
    x = feature_vector(df).reshape(1, -1)
    pd_prob = float(predict_proba(model, x).reshape(-1)[0])  # default prob
    cri = float(1.0 - pd_prob)                               # credit score ∈ [0,1]
    score_0_1000 = int(round(max(0.0, min(1.0, cri))*1000))  # contract range
    return cri, score_0_1000

def artifact_hash_for_csv(csv_path: str) -> str:
    with open(csv_path, "rb") as f:
        return sha256_hex(f.read())  # 32B hex string

# ---- Aggregator signature (Algorand-compatible Ed25519) ----
def sign_for_contract(user_addr_b32: str, score_u64: int, model_hash_hex: str, artifact_hash_hex: str, ts: int) -> str:
    from algosdk import encoding
    user_pk = encoding.decode_address(user_addr_b32)  # 32B
    msg = PREFIX + user_pk + to_u64_be(score_u64) + bytes.fromhex(model_hash_hex) + bytes.fromhex(artifact_hash_hex) + to_u64_be(ts)
    sig = AGG_SK.sign(msg).signature  # 64B
    return base64.b64encode(sig).decode()

# ---- API ----
class ScoreReq(BaseModel):
    userAddr: str = Field(..., description="Algorand address of scored user")

class ScoreRes(BaseModel):
    userAddr: str
    score: int
    modelHashHex: str
    artifactHashHex: str
    ts: int
    sigB64: str

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health(): return {"ok": True, "ts": now_ts()}

@app.post("/sign-score-latest", response_model=ScoreRes)
def sign_score_latest(body: ScoreReq):
    # 1) load model
    W, meta = load_model(MODEL_PATH)
    model_hash_hex = meta["_model_hash_hex"]

    # 2) select latest simulated client
    csv_path = load_latest_client_csv(DATA_DIR)
    art_hex = artifact_hash_for_csv(csv_path)

    # 3) score
    _, score_0_1000 = score_csv(W, csv_path)

    # 4) sign for contract
    ts = now_ts()
    sig_b64 = sign_for_contract(body.userAddr, score_0_1000, model_hash_hex, art_hex, ts)

    return {
        "userAddr": body.userAddr,
        "score": score_0_1000,
        "modelHashHex": model_hash_hex,
        "artifactHashHex": art_hex,
        "ts": ts,
        "sigB64": sig_b64
    }
