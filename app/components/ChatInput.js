import React from "react";
import { FaArrowUp } from "react-icons/fa";

export default function ChatInput({ query, onChange, onSend }) {
  return (
    <footer className="p-4">
      <div className="max-w-3xl mx-auto flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask me anything about Engineering..."
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          className="flex-1 px-4 py-2 bg-[#150050] text-white border border-[#3f0071] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f0071] font-inter transition duration-300 shadow focus:shadow-[0_0_10px_#800080]"
        />
        <button
          onClick={onSend}
          className="ml-4 px-4 py-3 bg-[#3f0071] text-white font-semibold rounded-full shadow-lg focus:shadow-[0_0_10px_#800080] hover:shadow-[0_0_10px_#800080] flex items-center justify-center transition duration-300"
        >
          <FaArrowUp className="w-4 h-4" />
        </button>
      </div>
    </footer>

    );
}