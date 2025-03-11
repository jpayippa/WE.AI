import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AiOutlineMessage } from 'react-icons/ai';
import { FaUser, FaCogs } from 'react-icons/fa';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-bl from-[#000000] via-[#150050] to-[#3f0071] text-white">
      {/* WE.AI Logo (positioned in the top-left corner) */}
      <div className="absolute top-4 left-6">
        <h1 className="text-2xl font-extrabold font-inter bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600 cursor-pointer hover:opacity-80 transition duration-300">
          WE.AI: ALPHA
        </h1>
      </div>

      {/* Hero Section */}
      <header className="max-w-3xl w-full mx-auto pt-20 text-center px-6">
        <h1 className="text-4xl font-bold leading-normal bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600 cursor-pointer hover:opacity-80 transition duration-300">
          Discover Your Program, Ask Anything.
        </h1>
        <p className="mt-4 font-semibold text-1xl">
          Your AI-powered assistant built by Western Engineering students to help streamline your learning experience.
        </p>
        <Link
          href="/chat"
          className="mt-8 inline-block px-6 py-3 bg-[#3e00713a] text-lg font-bold rounded-lg shadow-[0_0_30px_#a855f7] hover:shadow-[0_0_40px_#a855f7] transition duration-300"
        >
          Get Started ➝
        </Link>
      </header>

      {/* Info Boxes with Hover-Triggered Animated Icons */}
      <section className="w-full max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-6">
        {/* AI-Powered Chat */}
        <div className="p-6 bg-[#3e007138] rounded-xl shadow-lg transition duration-300 hover:shadow-[0_0_20px_#a855f7]">
          <motion.div
            className="flex justify-center mb-4"
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <AiOutlineMessage className="w-12 h-12 text-purple-400" />
          </motion.div>
          <h3 className="text-2xl font-bold">AI-Powered Chat</h3>
          <p className="mt-2">
            Ask engineering-related questions and get instant AI-generated responses.
          </p>
        </div>

        {/* Personalized Experience */}
        <div className="p-6 bg-[#3e007148] rounded-xl shadow-lg transition duration-300 hover:shadow-[0_0_20px_#a855f7]">
          <motion.div
            className="flex justify-center mb-4"
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <FaUser className="w-8 h-8 text-purple-400" />
          </motion.div>
          <h3 className="text-2xl font-bold">Personalized Experience</h3>
          <p className="mt-2">
            Your own session and history, tailored to your learning needs.
          </p>
        </div>

        {/* Made by Engineers */}
        <div className="p-6 bg-[#3e00714d] rounded-xl shadow-lg transition duration-300 hover:shadow-[0_0_20px_#a855f7]">
          <motion.div
            className="flex justify-center mb-4"
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <FaCogs className="w-12 h-12 text-purple-400" />
          </motion.div>
          <h3 className="text-2xl font-bold">Made by Engineers</h3>
          <p className="mt-2">
            Developed by Western University students with a passion for AI.
          </p>
        </div>
      </section>

      {/* Centered Image */}
      <div className="mt-10 flex justify-center px-6">
        <Image
          src="/image2.png"
          alt="WE.AI Interface Preview"
          width={900}
          height={500}
          className="rounded-lg shadow-lg border-4 border-purple-900 transition duration-300 hover:shadow-purple-500/50"
        />
      </div>

      {/* Footer (sticks to bottom via flex + mt-auto) */}
      <footer className="mt-2 text-center text-gray-400 w-full p-4">
        <p>
          Built by Western Software Engineering Students | &copy; {new Date().getFullYear()} WE.AI
        </p>
      </footer>
    </div>
  );
}
