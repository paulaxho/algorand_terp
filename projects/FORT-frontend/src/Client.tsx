export default function Client() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">Your Data, Your Credit.</h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
        Generate and manage your personal credit score privately on your device, then share it securely on the Algorand blockchain — only
        when <span className="font-semibold text-white">you</span> choose.
      </p>
      <button className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold rounded-lg hover:scale-105 transition-transform">
        Generate My Credit Score
      </button>
    </div>
  );
}
