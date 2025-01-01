// Frontend/weai/app/firebase/Auth.tsx
"use client";
import { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React from "react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async () => {
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#2e1065]">
      <div className="w-full max-w-xs">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          {isRegister ? "Register" : "Login"}
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-md"
        />
        <button
          onClick={handleAuth}
          className="w-full bg-[#2e1065] text-white py-2 rounded-md hover:bg-[#672ad8] transition"
        >
          {isRegister ? "Register" : "Login"}
        </button>
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-4 text-white"
        >
          {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};

export default Auth;