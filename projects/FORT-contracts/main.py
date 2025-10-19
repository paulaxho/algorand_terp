from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, constr
from nacl.signing import SigningKey
from nacl.encoding import RawEncoder
import base64, time, os
from dotenv import load_dotenv

load_dotenv()
AGG_SK = base64.b64decode(os.environ["AGG_SK_BASE64"])
SK = SigningKey(AGG_SK, encoder=RawEncoder)

PREFIX = b"FORT|score|v1|"

class SignReq(BaseModel):
    userPkB64: constr(min_length=44, max_length=44)  # 32B
    score: int
    modelHashB64: constr(min_length=44, max_length=44)
    artifactHashB64: constr(min_length=44, max_length=44)
    ts: int | None = None

class SignRes(BaseModel):
    sigB64: str
    ts: int

app = FastAPI()

@app.post("/sign-score", response_model=SignRes)
def sign_score(r: SignReq):
    try:
        user_pk = base64.b64decode(r.userPkB64)
        model_hash = base64.b64decode(r.modelHashB64)
        artifact_hash = base64.b64decode(r.artifactHashB64)
    except Exception:
        raise HTTPException(400, "bad base64")
    if not (len(user_pk)==32 and len(model_hash)==32 and len(artifact_hash)==32):
        raise HTTPException(400, "bad lengths")
    if not (0 <= r.score <= 1000):
        raise HTTPException(400, "score out of range")
    ts = r.ts or int(time.time())
    msg = PREFIX + user_pk + r.score.to_bytes(8,"big") + model_hash + artifact_hash + ts.to_bytes(8,"big")
    sig = SK.sign(msg).signature  # 64B
    return {"sigB64": base64.b64encode(sig).decode(), "ts": ts}
