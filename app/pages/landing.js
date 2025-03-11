// filepath: c:\Users\yoosu\OneDrive\Documents\Capstone\WE.AI2\WE.AI\app\pages\landing.js
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function LandingPage() {
  const { data: session } = useSession();  // Track user session

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-bl from-black via-purple-900 to-indigo-900 text-white p-6">
      {/* Hero Section */}
      <header className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Welcome to WE.AI
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Your AI-powered assistant built by Western Engineering students to help streamline your learning experience.
        </p>

        {session ? (
          <>
            <p className="mt-4 text-lg text-gray-300">Signed in as {session.user.name}</p>
            <button
              onClick={() => signOut()}
              className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-lg font-bold rounded-lg shadow-lg transition-all"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}  // Redirect to home after sign-in
            className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-lg font-bold rounded-lg shadow-lg transition-all"
          >
            Sign in with Google
          </button>
        )}
      </header>

      {/* Features Section */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-center">
        <div className="p-6 bg-indigo-800 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold">AI-Powered Chat</h3>
          <p className="mt-2 text-gray-300">Ask engineering-related questions and get instant AI-generated responses.</p>
        </div>
        <div className="p-6 bg-indigo-800 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold">Personalized Experience</h3>
          <p className="mt-2 text-gray-300">Your own session and history, tailored to your learning needs.</p>
        </div>
        <div className="p-6 bg-indigo-800 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold">Made by Engineers</h3>
          <p className="mt-2 text-gray-300">Developed by Western University students with a passion for AI.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-400">
        <p>Built by Western Software Engineering Students | &copy; {new Date().getFullYear()} WE.AI</p>
      </footer>
    </div>
  );
}
