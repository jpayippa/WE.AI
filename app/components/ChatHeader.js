// components/ChatHeader.js
/**
 * ChatHeader Component
 * ---------------------
 * Renders the application header of WE.AI, including:
 *  - Brand/logo (navigates to home)
 *  - Main title and subtitle
 *  - User controls: Home, History, New Chat, Sign Out
 *
 * Props:
 * @param {Function} onToggleHistory - Trigger to open/close chat history sidebar
 * @param {Function} onNewChat       - Trigger to start a new chat session
 * @param {Object}   session         - NextAuth user session object
 * @param {Object}   router          - Next.js router for navigation
 */
import React from "react";
// Icon imports
import { FaHome, FaHistory, FaArrowUp } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
// Auth utilities
import { useSession, signOut } from "next-auth/react";

export default function ChatHeader({ onToggleHistory, onNewChat, session, router }) {
  // Destructure NextAuth session
  const { data: userSession } = useSession();

  return (
    <header className="text-center py-6 relative">
      {/* Logo / Brand */}
      <div className="absolute top-4 left-6">
        <h1
          className="text-2xl font-extrabold font-inter bg-clip-text text-transparent bg-gradient-to-r
                     from-purple-500 to-indigo-600 cursor-pointer hover:opacity-80 transition duration-300"
          onClick={() => router.push("/")}
        >
          WE.AI: ALPHA
        </h1>
      </div>

      {/* Main Title and Subtitle */}
      <p className="text-4xl mt-20 font-bold font-inter text-white cursor-pointer relative transition duration-300">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 glow-hover-effect">
          Your Western Engineering AI Assistant.
        </span>
      </p>
      <p className="text-sm mt-2 font-bold font-inter text-white cursor-pointer hover:text-purple-400 transition duration-300">
        made by Western Software Engineering Students
      </p>

      {/* User Controls: Home, History, New Chat, Profile, Sign Out */}
      {userSession && (
        <div className="absolute top-4 right-6 flex items-center space-x-4">
          {/* App Controls Group */}
          <div className="flex items-center gap-3 bg-[#1a0a2e] px-3 py-1 rounded-full shadow-lg border border-purple-900">
            {/* Home Button */}
            <button onClick={() => router.push("/landing")} title="Home">
              <FaHome className="w-5 h-5 text-purple-400 hover:text-purple-300" />
            </button>
            <div className="h-6 w-px bg-purple-700" />

            {/* History Sidebar Toggle */}
            <button onClick={onToggleHistory} title="History">
              <FaHistory className="w-5 h-5 text-purple-400 hover:text-purple-300" />
            </button>

            {/* New Chat Trigger */}
            <button onClick={onNewChat} title="New Chat">
              <FaPenToSquare className="w-5 h-5 text-purple-400 hover:text-purple-300" />
            </button>
          </div>

          {/* Profile & Sign Out */}
          <div className="flex items-center gap-3 bg-[#1a0a2e] pl-3 pr-1 py-1.5 rounded-full shadow-lg border border-purple-900">
            {/* User Avatar */}
            <img
              src={userSession.user.image}
              alt="User Profile"
              className="w-8 h-8 rounded-full border-2 border-purple-600 shadow-md"
            />

            {/* Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm
                         font-medium rounded-full transition-all duration-200 flex items-center gap-1"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <FaArrowUp className="w-3 h-3 rotate-45" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}