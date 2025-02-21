import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Store and Manage Your
            <span className="text-indigo-600"> AI Prompts</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
            PromptVault helps you organize, store, and manage your AI prompts in one secure place.
            Never lose a great prompt again.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-white px-8 py-3 text-lg font-semibold text-gray-900 shadow ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="text-center">
            <div className="flex justify-center items-center w-12 h-12 mx-auto bg-indigo-100 rounded-xl">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">Organize Your Prompts</h3>
            <p className="mt-2 text-gray-500">Categorize and tag your prompts for easy access and better organization.</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center items-center w-12 h-12 mx-auto bg-indigo-100 rounded-xl">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">Secure Storage</h3>
            <p className="mt-2 text-gray-500">Your prompts are safely stored and accessible only to you.</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center items-center w-12 h-12 mx-auto bg-indigo-100 rounded-xl">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">Easy Updates</h3>
            <p className="mt-2 text-gray-500">Quickly edit and update your prompts as your needs evolve.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
