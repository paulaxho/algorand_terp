import { useState } from "react";

// This is a frontend-only demo component.
// All backend and blockchain interactions have been removed to simulate the user experience.

export default function Business() {
  // State to track if the wallet is "connected"
  const [isConnected, setIsConnected] = useState(false);
  // State to manage loading for async operations
  const [isLoading, setIsLoading] = useState(false);
  // State to show a success message after the transaction
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ Simulate connecting to the Lute wallet
  function handleConnect() {
    setIsLoading(true);
    setSuccessMessage(""); // Clear previous messages

    // Simulate a network delay for a more realistic feel
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 1500); // 1.5 second delay
  }

  // ✅ Simulate appending the score to the blockchain
  function handleAppendScore() {
    setIsLoading(true);
    setSuccessMessage(""); // Clear previous messages

    // Simulate the time it takes to sign and send a transaction
    setTimeout(() => {
      // On "success", update the UI to show a confirmation
      setSuccessMessage("Score appended successfully! TxID: 5G2END...Y37A");
      setIsLoading(false);

      // Optional: Hide the success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }, 2500); // 2.5 second delay
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">
        Empower Decisions with Verified Data.
      </h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
        Access cryptographically verified credit data from users who consent — all stored and validated on the Algorand blockchain.
      </p>

      {/* Wrapper to prevent layout shift when success message appears */}
      <div className="h-20 flex flex-col items-center justify-center">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-75 disabled:scale-100"
          >
            {isLoading ? "Connecting..." : "Connect Lute Wallet"}
          </button>
        ) : (
          <button
            onClick={handleAppendScore}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-black font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-75 disabled:scale-100"
          >
            {isLoading ? "Submitting to Blockchain..." : "Append Credit Score"}
          </button>
        )}

        {successMessage && (
            <p className="mt-4 text-green-400 animate-pulse">{successMessage}</p>
        )}
      </div>
    </div>
  );
}
