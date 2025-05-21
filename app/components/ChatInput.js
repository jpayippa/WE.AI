/**
 * ChatInput.js
 *
 * Renders the input box and send button for submitting new chat messages,
 * with a gradient‐clipped placeholder and input text that remains gradient
 * even after blur.
 */

import React from "react";
import { FaArrowUp } from "react-icons/fa";

export default function ChatInput({ query, onChange, onSend }) {
  return (
    <footer className="p-4">
      {/* Center container */}
      <div className="max-w-3xl mx-auto flex items-center">
        {/* Gradient‐clipped input */}
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Ask me anything about Engineering..."
          className={`
            flex-1 px-4 py-2
            bg-[#150050]
            bg-gradient-to-r from-pink-400 via-purple-400 to-purple-500
            bg-clip-text text-transparent
            border border-[#3f0071] rounded-lg
            focus:outline-none focus:ring-2 focus:ring-[#3f0071]
            transition duration-300
            shadow focus:shadow-[0_0_10px_#800080]
          `}
        />

        {/* Send button */}
        <button
          onClick={onSend}
          title="Send message"
          className={`
            ml-4 px-4 py-3
            bg-[#3f0071] text-white font-semibold
            rounded-full shadow-lg
            hover:shadow-[0_0_10px_#800080]
            transition duration-300
            flex items-center justify-center
          `}
        >
          <FaArrowUp className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
