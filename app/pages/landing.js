import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-20 text-center animated-gradient text-white p-6">
      {/* Hero Section */}
      <header className="text-center max-w-3xl">
   
  
        
        
        
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer hover:opacity-80 transition duration-300">
          Welcome to WE.AI
          ‎ 
        </h1>
        <p className="mt-4 font-semibold text-1xl text-white">
          Your AI-powered assistant built by Western Engineering students to help streamline your learning experience.
        </p>
        <Link 
          href="/chat" 
          className="mt-8 inline-block px-6 py-3 bg-[#3e00713a] hover:bg-[#150050] text-lg font-bold rounded-lg shadow-lg transition-all"
        >
          Get Started ➝
        </Link>
      </header>
      



     {/* WE.AI Logo */}
     <div className="absolute top-4 left-6">
        <h1 className="text-2xl font-extrabold font-inter bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer hover:opacity-80 transition duration-300">
          WE.AI: ALPHA
        </h1>
      </div>
      

      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-center">
        <div className="p-6 bg-[#3e007138] rounded-xl shadow-lg transition duration-300 hover:shadow-[0_0_20px_#a855f7]">
          <h3 className="text-2xl font-bold">AI-Powered Chat</h3>
          <p className="mt-2 text-white">Ask engineering-related questions and get instant AI-generated responses.</p>
        </div>
        <div className="p-6 bg-[#3e007148] rounded-xl shadow-lg transition duration-300 hover:shadow-[0_0_20px_#a855f7]">
          <h3 className="text-2xl font-bold">Personalized Experience</h3>
          <p className="mt-2 text-white">Your own session and history, tailored to your learning needs.</p>
        </div>
        <div className="p-6 bg-[#3e00714d] rounded-xl shadow-lg transition duration-300 hover:shadow-[0_0_20px_#a855f7]">
          <h3 className="text-2xl font-bold">Made by Engineers</h3>
          <p className="mt-2 text-white">Developed by Western University students with a passion for AI.</p>
        </div>
      </section>


{/* Features Section with Permanent Purple Glow Effect */}
{/* <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-center">
  <div className="p-6 bg-[#3e007138] rounded-xl shadow-[0_0_20px_#a855f7]">
    <h3 className="text-2xl font-bold">AI-Powered Chat</h3>
    <p className="mt-2 text-white">Ask engineering-related questions and get instant AI-generated responses.</p>
  </div>
  <div className="p-6 bg-[#3e007148] rounded-xl shadow-[0_0_20px_#a855f7]">
    <h3 className="text-2xl font-bold">Personalized Experience</h3>
    <p className="mt-2 text-white">Your own session and history, tailored to your learning needs.</p>
  </div>
  <div className="p-6 bg-[#3e00714d] rounded-xl shadow-[0_0_20px_#a855f7]">
    <h3 className="text-2xl font-bold">Made by Engineers</h3>
    <p className="mt-2 text-white">Developed by Western University students with a passion for AI.</p>
  </div>
</section> */}

  {/* Centered Image with Glow */}
  <div className="mt-10 flex justify-center">
          <Image 
            src="/image2.png" 
            alt="WE.AI Interface Preview" 
            width={900} 
            height={500} 
            className="rounded-lg shadow-lg border-4 border-purple-900 transition duration-300 hover:shadow-purple-500/50"
          />
        </div>

      {/* Footer */}
      <footer className="mt-auto text-center text-gray-400 w-full p-4">
        <p>Built by Western Software Engineering Students | &copy; {new Date().getFullYear()} WE.AI</p>
      </footer>
    </div>
  );
}
