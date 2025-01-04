// Frontend/weai/app/page.tsx
"use client"

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import React from "react";
import AuthPage from "./firebase/auth"
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";


export default function Home() {
  const [messages, setMessages] = useState<{ user: boolean; text: string }[]>([]);
  const [input, setInput] = useState("");

  const [token, setToken] = useState([])
  const chatContainerRef = useRef<HTMLDivElement | null>(null); 

  const [user, setUser] = useState<User | null>(null);
  //on load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://us-central1-we-ai-442218.cloudfunctions.net/generateToken');
        const result = await response.json();
        const tk = result.token
        setToken(tk)
      } catch (err) {
        console.log(err)
      }
    }
    fetchData();
  },[]);  


  const handleSend = async () => {
    if (!input.trim()) return;
  
    // Add user's message

    setMessages((prev) => [...prev, { user: true, text: input }]);
  
    const userMessage = input;
    setInput("");  // Clear input immediately for better UX
  
    try {

      setMessages((prev) => [
        ...prev,
        { user: false, text: "Thinking..." },
      ]);
  
      // API call to get chatbot response
      const response = await fetch("https://us-central1-dialogflow.googleapis.com/v3/projects/we-ai-442218/locations/us-central1/agents/6e63cb11-8f42-4c9a-9f2c-fe3e0b41ccdd/sessions/2a7f4c12-987b-4b25-a7d6-e53b2a94c92d:detectIntent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          queryInput: {
            text: {
              text: `${userMessage}`
            },
            languageCode: "en"
          }
        }),
      });
      const data = await response.json();
      console.log(data);
      console.log(data.queryResult.responseMessages[0].text.text[0]);

      setMessages((prev) => [
        ...prev.slice(0, -1),  
        { user: false, text: `${data.queryResult.responseMessages[0].text.text[0]}`},
      ]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),  
        { user: false, text: "Sorry, something went wrong. Please try again." },
      ]);
    }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

    setInput("");
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return <AuthPage />;
  }


  return (
    <div className="flex flex-col h-screen bg-[#2e1065]">
      <div className="sticky top-0 w-full p-4 bg-white overflow-hidden shadow-xl flex justify-between items-center">
        <h1 className="text-xl text-left font-extrabold font-leading-none tracking-tight text-gray-900 md:text-xl lg:text-2xl dark:text-[#2e1065]">
          <Link href="/">WE.AI</Link>
        </h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Logout
        </button>
      </div>
      <div className="flex flex-col w-full bg-[#2e1065] items-center rounded-lg overflow-hidden p-4">
        <h1 className="mb-4 mt-4 text-xl text-center font-extrabold font-leading-none tracking-tight text-gray-900 md:text-xl lg:text-2xl dark:text-white">
          Welcome to WE.AI
        </h1>
        <p className="mb-4 text-xl text-center text-wrap font-regular leading-none tracking-tight text-gray-900 md:text-m lg:text-l dark:text-white">
          Ask anything about Western Engineering. We're here to help you navigate resources, answer questions, and more!
        </p>
      </div>
      <div className="flex flex-col w-full h-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.user ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-lg p-3 ${message.user ? "bg-[#2e1065] text-white" : "bg-gray-200 text-gray-900"}`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center p-4 border-t border-gray-300">
          <input
            type="text"
            className="flex-grow p-2 border rounded-lg focus:outline-none text-[#2e1065]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
          />
          <button onClick={handleSend} className="ml-4 px-4 py-2 bg-[#2e1065] text-white rounded-lg hover:bg-[#672ad8]">
            Send
          </button>
        </div>
      </div>
      <div className="flex justify-left top-0 w-full p-4 bg-[#180738] overflow-hidden">
        <p className="text-md text-left mr-4 font-regular font-leading-none tracking-tight text-gray-900 md:text-md lg:lg dark:text-[#ffffff]">
          <Link href="/feedback">Feedback</Link>
        </p>
        <p className="text-md text-left font-regular font-leading-none tracking-tight text-gray-900 md:text-md lg:lg dark:text-[#ffffff]">
          <Link href="/termsofservice">Terms of Service</Link>
        </p>
      </div>
    </div>
  );
}
