// Frontend/weai/app/firebase/Auth.tsx
"use client";
import { useState } from "react";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("All fields are required.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#2e1065]">
      <div className="w-full max-w-xs">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          {isRegister ? "Register" : "Log In"}
        </h1>
        {errorMessage && (
          <p className="text-red-500 text-center">{errorMessage}</p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-md text-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-md text-black"
        />
        <button
          onClick={handleAuth}
          disabled={loading}
          className={`w-full ${loading ? "bg-gray-500" : "bg-white text-black border border-black"} py-2 rounded-md hover:bg-gray-200 transition`}
        >
          {loading ? "Processing..." : isRegister ? "Register" : "Login"}
        </button>
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-4 text-white"
        >
          {isRegister ? "Already have an account? Log in" : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};

export default Auth;

