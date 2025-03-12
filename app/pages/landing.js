"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AiOutlineMessage } from 'react-icons/ai';
import { FaUser, FaCogs } from 'react-icons/fa';

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-bl from-[#000000] via-[#150050] to-[#3f0071] text-white">
      {/* Logo on the top-left */}
      <div className="absolute top-4 left-6">
        <h1 className="text-2xl font-extrabold font-inter bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600 cursor-pointer hover:opacity-80 transition duration-300">
          WE.AI: ALPHA
        </h1>
      </div>

      {/* Auth Status on the top-right */}
      <div className="absolute top-8 right-10 flex items-center space-x-6">
        {session ? (
          <>
            <p className="text-purple-300">{session.user.name}</p>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-[#3e00713a] rounded-lg shadow-[0_0_5px_#a855f7] hover:shadow-[0_0_15px_#a855f7] transition duration-300"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => signIn("google", { callbackUrl: "/chat" })}
              className="px-4 py-2 bg-[#3e00713a] font-bold rounded-lg shadow-[0_0_5px_#a855f7] hover:shadow-[0_0_15px_#a855f7] transition duration-300"
            >
              Login
            </button>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-[#3e00713a] font-bold rounded-lg shadow-[0_0_5px_#a855f7] hover:shadow-[0_0_15px_#a855f7] transition duration-300"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Hero Section */}
      <header className="max-w-3xl w-full mx-auto pt-20 text-center px-6">
        <h1 className="text-4xl font-bold leading-normal bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600 cursor-pointer hover:opacity-80 transition duration-300">
          Discover Your Program, Ask Anything.
        </h1>
        <p className="mt-4 font-semibold text-1xl  hover:text-purple-400 transition duration-300">
          Your AI-powered engineering assistant built by Western Engineering students to help streamline your learning experience.
        </p>

        {/* Buttons container */}
        <div className="mt-10 flex justify-center space-x-4">
          {/* Dynamic Get Started Button */}
          {session ? (
            <Link
              href="/chat"
              className="inline-block px-6 py-3 bg-[#3e00713a] text-lg font-bold rounded-lg shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_40px_#a855f7] transition duration-300"
            >
              Get Started
            </Link>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/chat" })}
              className="inline-block px-6 py-3 bg-[#3e00713a] text-lg font-bold rounded-lg shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_40px_#a855f7] transition duration-300"
            >
              Get Started
            </button>
          )}

          {/* About the Creators Button */}
          <Link
            href="/about"
            className="inline-block px-6 py-3 bg-[#3e00713a] text-lg font-bold rounded-lg shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_40px_#a855f7] transition duration-300"
          >
            About Us
          </Link>
        </div>
      </header>

      {/* Info Boxes */}
      <section className="w-full max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center px-6">
        {/* AI-Powered Chat */}
        <div className="p-4 bg-[#3e007138] rounded-lg shadow-lg transition duration-300 hover:shadow-[0_0_20px_#a855f7]">
          <motion.div
            className="flex justify-center mb-3"
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <AiOutlineMessage className="w-10 h-10 text-purple-400" />
          </motion.div>
          <h3 className="text-xl font-bold">AI-Powered Chat</h3>
          <p className="mt-2 text-sm">
            Ask engineering-related questions and get instant AI-generated responses.
          </p>
        </div>

        {/* Personalized Experience */}
        <div className="p-4 bg-[#3e007148] rounded-lg shadow-lg transition duration-300 hover:shadow-[0_0_20px_#a855f7]">
          <motion.div
            className="flex justify-center mb-3"
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <FaUser className="w-8 h-8 text-purple-400" />
          </motion.div>
          <h3 className="text-xl font-bold">Personalized Experience</h3>
          <p className="mt-2 text-sm">
            Your own session and history, tailored to your learning needs.
          </p>
        </div>

        {/* Made by Engineers */}
        <div className="p-4 bg-[#3e00714d] rounded-lg shadow-lg transition duration-300 hover:shadow-[0_0_20px_#a855f7]">
          <motion.div
            className="flex justify-center mb-3"
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <FaCogs className="w-10 h-10 text-purple-400" />
          </motion.div>
          <h3 className="text-xl font-bold">Made by Engineers</h3>
          <p className="mt-2 text-sm">
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

      {/* Footer */}
      <footer className="mt-2 text-center text-gray-400 w-full p-4">
        <p>
          Built by Western Software Engineering Students | &copy; {new Date().getFullYear()} WE.AI
        </p>
      </footer>
    </div>
  );
}