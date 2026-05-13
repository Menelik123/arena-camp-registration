export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-yellow-400 text-xs uppercase tracking-widest font-medium mb-2">Payment Confirmed</p>
        <h1 className="text-2xl font-bold text-white mb-3">You&apos;re all set!</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          A confirmation email with your registration details and everything you need to know before camp is on its way to your inbox.
        </p>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-left space-y-2 mb-6">
          <p className="text-xs text-yellow-400 uppercase tracking-widest font-medium mb-2">Before Camp Day</p>
          <p className="text-sm text-gray-300">&#x2713; &nbsp;Check your email for the full confirmation</p>
          <p className="text-sm text-gray-300">&#x2713; &nbsp;Wear comfortable athletic clothing</p>
          <p className="text-sm text-gray-300">&#x2713; &nbsp;Bring a water bottle</p>
          <p className="text-sm text-gray-300">&#x2713; &nbsp;Check-in opens 15 min before your session</p>
        </div>
        <p className="text-gray-600 text-xs">Questions? Visit thearenalilburn.com</p>
      </div>
    </div>
  );
}
