/**
 * ChatMessage.js
 *
 * Renders a single chat message bubble, complete with
 * inline controls for editing, refreshing, copying, and TTS.
 *
 * Props:
 * @param {object}  msg               - The message object ({ sender, text, id }).
 * @param {number}  index             - Index of this message in the list.
 * @param {number|null} editIndex     - Index of the message currently being edited.
 * @param {string}  editText          - Current text in the edit input.
 * @param {function} setEditText      - Setter for updating `editText`.
 * @param {function} onSaveEdit       - Handler to save an edited message.
 * @param {function} onCancelEdit     - Handler to cancel editing.
 * @param {function} onEdit           - Handler to initiate editing (receives index).
 * @param {function} onRefresh        - Handler to refresh a message (receives index).
 * @param {function} onCopy           - Handler to copy text to clipboard (receives text).
 * @param {function} onTts            - Handler to play/stop text-to-speech (receives text).
 * @param {boolean} ttsSupported      - Whether TTS is supported in the browser.
 * @param {boolean} isSpeechPlaying   - Whether TTS is currently active.
 * @param {object|null} currentUtterance - Current SpeechSynthesisUtterance object.
 */

import React from "react";
import {
  FaEdit,
  FaSync,
  FaCopy,
  FaVolumeUp,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { formatMessage } from "@/utils/format";

export default function ChatMessage({
  msg,
  index,
  editIndex,
  editText,
  setEditText,
  onSaveEdit,
  onCancelEdit,
  onEdit,
  onRefresh,
  onCopy,
  onTts,
  ttsSupported,
  isSpeechPlaying,
  currentUtterance,
}) {
  // Determine if this message was sent by the user
  const isUser = msg.sender === "user";
  // Determine if this message is currently in edit mode
  const isEditing = editIndex === index;

  // --- Editing UI ---
  if (isEditing) {
    return (
      <div className="flex justify-end group space-x-2">
        {/* Editable text input */}
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="
            flex-1              /* fill horizontal space */
            px-4 py-2           /* padding */
            bg-[#150050]        /* dark background */
            text-white          /* white text */
            rounded-lg          /* rounded corners */
            border border-[#3f0071] /* purple border */
            focus:outline-none
            focus:ring-2 focus:ring-[#3f0071]
          "
        />

        {/* Save edit button */}
        <button onClick={onSaveEdit} className="text-green-500" title="Save">
          <FaSave />
        </button>
        {/* Cancel edit button */}
        <button onClick={onCancelEdit} className="text-red-500" title="Cancel">
          <FaTimes />
        </button>
      </div>
    );
  }

  // --- Normal message UI ---
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div className="flex items-center space-x-2">
        {/* Message bubble */}
        <div
          className={`
            max-w-lg px-4 py-2 rounded-xl shadow
            ${isUser ? "bg-[#3f0071] text-white" : "bg-indigo-900 text-white"}
          `}
        >
          {msg.sender === "bot" ? (
            // Render bot HTML safely
            <div
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
            />
          ) : (
            // Render user text
            msg.text
          )}
        </div>

        {/* Hover controls container */}
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isUser ? (
            <>
              {/* Edit message */}
              <button
                onClick={() => onEdit(index)}
                className="text-gray-400 hover:text-white"
                title="Edit"
              >
                <FaEdit />
              </button>
              {/* Refresh (re-run) message */}
              <button
                onClick={() => onRefresh(index)}
                className="text-blue-400 hover:text-white"
                title="Refresh"
              >
                <FaSync />
              </button>
              {/* Copy message text */}
              <button
                onClick={() => onCopy(msg.text)}
                className="text-purple-400 hover:text-purple-300"
                title="Copy"
              >
                <FaCopy />
              </button>
            </>
          ) : (
            <>
              {/* Copy bot response */}
              <button
                onClick={() => onCopy(msg.text)}
                className="text-purple-400 hover:text-purple-300"
                title="Copy"
              >
                <FaCopy />
              </button>
              {/* Text-to-speech toggle */}
              {ttsSupported && (
                <button
                  onClick={() => onTts(msg.text)}
                  className={`
                    ${isSpeechPlaying && currentUtterance?.text === msg.text
                      ? "text-purple-300"
                      : "text-purple-400"
                    } hover:text-purple-300
                  `}
                  title={
                    isSpeechPlaying && currentUtterance?.text === msg.text
                      ? "Stop speech"
                      : "Play speech"
                  }
                >
                  <FaVolumeUp />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
