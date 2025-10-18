export default function Business() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">Empower Decisions with Verified Data.</h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
        Access cryptographically verified credit data from users who consent — all stored and validated on the Algorand blockchain.
      </p>
      <button className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-lg hover:scale-105 transition-transform">
        Connect as a Business
      </button>
    </div>
  );
}
