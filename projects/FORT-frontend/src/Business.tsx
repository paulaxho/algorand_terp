import { useState } from "react";
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
const ALGOD = new algosdk.Algodv2("", import.meta.env.VITE_ALGOD_URL, "");


const peraWallet = new PeraWalletConnect();

export default function Business() {
  const [account, setAccount] = useState<string | null>(null);

  async function connectWallet() {
    try {
      const newAccounts = await peraWallet.connect();
      peraWallet.connector?.on("disconnect", () => setAccount(null));
      setAccount(newAccounts[0]);
    } catch (err) {
      console.error("connect error", err);
    }
  }

  // async function appendScore() {
  //   if (!account) return;

  //   // Example: empty transaction just to prove connection
  //   const client = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");
  //   const sp = await client.getTransactionParams().do();
  //   const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  //     from: account,
  //     to: account,
  //     amount: 0, // no-op, just testing
  //     suggestedParams: sp,
  //   });

  //   const signedTxn = await peraWallet.signTransaction([[{ txn, signers: [account] }]]);
  //   const { txId } = await client.sendRawTransaction(signedTxn).do();
  //   console.log("txId", txId);
  // }
  // add to top:
const APP_ID = Number(import.meta.env.VITE_FORT_APP_ID);
const SIGN_API = import.meta.env.VITE_SIGN_API as string;

// helpers:
const u64 = (n: number|bigint) => algosdk.bigIntToBytes(BigInt(n), 8);
const hex32 = (h: string) => new Uint8Array(Buffer.from(h.replace(/^0x/,""), "hex"));

async function appendScore() {
  if (!account) return;

  // 1) ask backend to score latest client + sign
  const r = await fetch(`${SIGN_API}/sign-score-latest`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ userAddr: account })
  });
  if (!r.ok) { console.error("sign-score-latest failed"); return; }
  const { score, modelHashHex, artifactHashHex, ts, sigB64 } = await r.json();

  // 2) build AppCall
  const userPk = algosdk.decodeAddress(account).publicKey;
  const appArgs = [
    new Uint8Array(Buffer.from("append_score_v1")),
    userPk,
    u64(score),
    hex32(modelHashHex),
    hex32(artifactHashHex),
    u64(ts),
    new Uint8Array(Buffer.from(sigB64, "base64")),
  ];

  const sp = await ALGOD.getTransactionParams().do();
  const boxKey = new Uint8Array(algosdk.sha256(new Uint8Array([...userPk, ...u64(ts)])));
  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: account,
    appIndex: APP_ID,
    appArgs,
    suggestedParams: sp,
    boxes: [{ appIndex: APP_ID, name: boxKey }],
  });

  // 3) sign + send via Pera
  // Pera requires encoded unsigned txn
  const encoded = algosdk.encodeUnsignedTransaction(txn);
  const signed = await peraWallet.signTransaction([[{ txn: encoded, signers: [account] }]]);
  const { txId } = await ALGOD.sendRawTransaction(signed.map((s:any)=>s)).do();
  console.log("txId", txId);

  // 4) cache for display
  const saved = { userAddr: account, scoreU16: score*10, modelHashHex, artifactHashHex, ts };
  localStorage.setItem("FORT:lastScore", JSON.stringify(saved));
}


  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">Empower Decisions with Verified Data.</h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
        Access cryptographically verified credit data from users who consent — all stored and validated on the Algorand blockchain.
      </p>

      {!account ? (
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-lg hover:scale-105 transition-transform"
        >
          Connect as a Business
        </button>
      ) : (
        <button
          onClick={appendScore}
          className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-black font-semibold rounded-lg hover:scale-105 transition-transform"
        >
          Append Credit Score
        </button>
      )}
    </div>
  );
}
