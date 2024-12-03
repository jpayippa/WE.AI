"use client"
import Image from "next/image";
import { useState } from "react";

export default function Home() {

  const [messages, setMessages] = useState<{ user: boolean; text: string }[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user's message
    setMessages((prev) => [...prev, { user: true, text: input }]);

    // Simulate a chatbot response (replace this with your API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { user: true, text: input },
        { user: false, text: `You said: "${input}"` },
      ]);
    }, 1000);

    // Clear input
    setInput("");
  };


  return (
    <div className="flex flex-col items-center h-screen bg-[#2e1065] p-4">
      <div className="flex flex-col w-full max-wxlx bg-[#2e1065] shadow-lg rounded-lg overflow-hidden"> 
        <h1 className="mb-4 mt-4 text-xl text-center font-extrabold font- leading-none  tracking-tight text-gray-900 md:text-xl lg:text-2xl dark:text-white">Welcome to WE.AI</h1>
        <p className="mb-20 text-xl text-center text-wrap font-regular leading-none  tracking-tight text-gray-900 md:text-m lg:text-l dark:text-white">Ask anything about Western Engineering. We're here to help you navigate resources, answer questions, and more!</p>
      </div>  
    <div className="flex flex-col w-full max-wxlx h-full bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.user ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg p-3 ${
                message.user
                  ? "bg-[#2e1065] text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
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
        <button
          onClick={handleSend}
          className="ml-4 px-4 py-2 bg-[#2e1065] text-white rounded-lg hover:bg-[#241049]"
        >
          Send
        </button>
      </div>
    </div>
  </div>
  );
}
