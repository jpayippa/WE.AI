/**
 * LandingPage.js
 *
 * Public landing page for WE.AI, showcasing:
 *  - Logo and branding
 *  - Authentication status (Login / Sign Out)
 *  - Hero section with primary call-to-action
 *  - Feature/info boxes grid
 *  - Interface preview image
 *  - Footer with privacy policy modal trigger
 *
 * Utilizes:
 *  - NextAuth for session management
 *  - framer-motion for potential animations
 *  - next/image for optimized image loading
 *  - react-icons for iconography
 *  - PrivacyPolicyModal for GDPR/privacy compliance
 */

"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AiOutlineMessage } from "react-icons/ai";
import { FaUser, FaCogs } from "react-icons/fa";
import PrivacyPolicyModal from "../utils/privacyModal";

export default function LandingPage() {
  // --- Session & Modal State ---
  const { data: session } = useSession();        // Current user session
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-bl from-[#000000] via-[#150050] to-[#3f0071] text-white">

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Logo / Branding */}
      <div className="absolute top-4 left-6">
        <h1
          className="
            text-2xl font-extrabold font-inter
            bg-clip-text text-transparent
            bg-gradient-to-r from-purple-500 to-indigo-600
            cursor-pointer hover:opacity-80 transition duration-300
          "
        >
          WE.AI: ALPHA
        </h1>
      </div>

      {/* Authentication Status / Buttons */}
      <div className="absolute top-8 right-10 flex items-center space-x-6">
        {session ? (
          <>
            {/* Display user name */}
            <p className="text-purple-300">{session.user.name}</p>
            {/* Sign Out button */}
            <button
              onClick={() => signOut()}
              className="
                px-4 py-2 bg-[#3e00713a] rounded-lg
                shadow-[0_0_5px_#a855f7] hover:shadow-[0_0_15px_#a855f7]
                transition duration-300
              "
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            {/* Login button */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/chat" })}
              className="
                px-4 py-2 bg-[#3e00713a] font-bold rounded-lg
                shadow-[0_0_5px_#a855f7] hover:shadow-[0_0_15px_#a855f7]
                transition duration-300
              "
            >
              Login
            </button>
            {/*
            // You can enable sign-up when ready:
            <Link href="/signup" className="...">Sign Up</Link>
            */}
          </>
        )}
      </div>

      {/* Hero Section */}
      <header className="max-w-3xl w-full mx-auto pt-20 text-center px-6">
        {/* Main headline */}
        <h1
          className="
            text-4xl font-bold leading-normal
            bg-clip-text text-transparent
            bg-gradient-to-r from-purple-500 to-indigo-600
            cursor-pointer hover:opacity-80 transition duration-300
          "
        >
          Discover Your Program, Ask Anything.
        </h1>
        {/* Subheading */}
        <p className="mt-4 font-semibold text-1xl hover:text-purple-400 transition duration-300">
          Your AI-powered engineering assistant built by Western Engineering
          students to help streamline your learning experience.
        </p>

        {/* Primary Call-to-Action Buttons */}
        <div className="mt-10 flex justify-center space-x-4">
          {session ? (
            <Link
              href="/chat"
              className="
                inline-block px-6 py-3 bg-[#3e00713a]
                text-lg font-bold rounded-lg
                shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_40px_#a855f7]
                transition duration-300
              "
            >
              Get Started
            </Link>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/chat" })}
              className="
                inline-block px-6 py-3 bg-[#3e00713a]
                text-lg font-bold rounded-lg
                shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_40px_#a855f7]
                transition duration-300
              "
            >
              Get Started
            </button>
          )}
          <Link
            href="/about"
            className="
              inline-block px-6 py-3 bg-[#3e00713a]
              text-lg font-bold rounded-lg
              shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_40px_#a855f7]
              transition duration-300
            "
          >
            About Us
          </Link>
        </div>
      </header>

      {/* Info Boxes Section */}
      <section className="w-full max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center px-6">
        {/* TODO: Replace with <InfoBoxes items={…} /> component */}
        {/* Example info box:
            <div className="p-6 bg-[#1a0a2e] rounded-lg">
              <AiOutlineMessage size={48} className="mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">Instant Answers</h3>
              <p>Ask any engineering question and get AI-driven guidance.</p>
            </div>
        */}
      </section>

      {/* Interface Preview Image */}
      <div className="mt-10 flex justify-center px-6">
        <Image
          src="/image2.png"
          alt="WE.AI Interface Preview"
          width={900}
          height={500}
          className="
            rounded-lg shadow-lg border-4 border-purple-900
            transition duration-300 hover:shadow-purple-500/50
          "
        />
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center">
        <div className="text-gray-400">
          <p className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <span>Built by Western Software Engineering Students</span>
            <span className="hidden sm:inline">|</span>
            <span>&copy; {new Date().getFullYear()} WE.AI</span>
            <span className="hidden sm:inline">|</span>
            {/* Privacy Policy link triggers modal */}
            <span
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-purple-400 cursor-pointer transition-colors block sm:inline"
              title="View Privacy Policy"
            >
              Privacy Policy
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
