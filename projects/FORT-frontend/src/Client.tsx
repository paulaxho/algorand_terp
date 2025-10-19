export default function Client() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Generate Your Credit Score</h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          Your data stays on your device. If you agree, we’ll produce a local credit score using federated learning and store it securely on
          Algorand.
        </p>

        <button className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors cursor-pointer">
          Produce Data
        </button>

        <div className="my-6 border-t border-gray-200" />

        <button className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Decline Offer</button>
      </div>
    </div>
  );
}
