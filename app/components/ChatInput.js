/**
 * ChatInput.js
 *
 * Renders the input box and send button for submitting new chat messages.
 * 
 * Props:
 * @param {string} query        - Current text in the input field.
 * @param {function} onChange   - Handler called with new text when the input changes.
 * @param {function} onSend     - Handler called when the user submits (clicks send or presses Enter).
 */

import React from "react";
import { FaArrowUp } from "react-icons/fa";

export default function ChatInput({ query, onChange, onSend }) {
  return (
    <footer className="p-4">
      {/* Container centers the input and button within the viewport */}
      <div className="max-w-3xl mx-auto flex items-center">
        {/* Text input field */}
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // Submit on Enter key press
            if (e.key === "Enter") onSend();
          }}
          placeholder="Ask me anything about Engineering..."
          className="
            flex-1                /* grow to fill available horizontal space */
            px-4 py-2             /* padding inside the input */
            bg-[#150050]          /* dark background */
            text-white            /* white text */
            border border-[#3f0071] /* purple border */
            rounded-lg            /* rounded corners */
            focus:outline-none    /* remove default outline */
            focus:ring-2          /* add ring on focus */
            focus:ring-[#3f0071]  /* purple ring color */
            transition duration-300 /* smooth transitions */
            shadow                /* subtle box shadow */
            focus:shadow-[0_0_10px_#800080] /* glow on focus */
          "
        />

        {/* Send button */}
        <button
          onClick={onSend}
          title="Send message"
          className="
            ml-4                   /* space from input */
            px-4 py-3             /* padding */
            bg-[#3f0071]          /* purple background */
            text-white            /* white icon/text */
            font-semibold
            rounded-full          /* pill shape */
            shadow-lg             /* pronounced box shadow */
            hover:shadow-[0_0_10px_#800080] /* glow on hover */
            transition duration-300 /* smooth hover transition */
            flex items-center justify-center /* center icon */
          "
        >
          <FaArrowUp className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
