import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-20 text-center bg-gradient-to-bl from-[#000000] via-[#150050] to-[#3f0071] text-white p-6">
      {/* Hero Section */}
      <header className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Welcome to WE.AI
        </h1>
        <p className="mt-4 text-lg text-white">
          Your AI-powered assistant built by Western Engineering students to help streamline your learning experience.
        </p>
        <Link 
          href="/" 
          className="mt-8 inline-block px-6 py-3 bg-[#3f0071] hover:bg-[#150050] text-lg font-bold rounded-lg shadow-lg transition-all"
        >
          Start Chatting
        </Link>
      </header>

      {/* Features Section */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-center">
        <div className="p-6 bg-[#3f0071] rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold">AI-Powered Chat</h3>
          <p className="mt-2 text-white">Ask engineering-related questions and get instant AI-generated responses.</p>
        </div>
        <div className="p-6 bg-[#3f0071] rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold">Personalized Experience</h3>
          <p className="mt-2 text-white">Your own session and history, tailored to your learning needs.</p>
        </div>
        <div className="p-6 bg-[#3f0071] rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold">Made by Engineers</h3>
          <p className="mt-2 text-white">Developed by Western University students with a passion for AI.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto text-center text-gray-400 w-full p-4">
        <p>Built by Western Software Engineering Students | &copy; {new Date().getFullYear()} WE.AI</p>
      </footer>
    </div>
  );
}
