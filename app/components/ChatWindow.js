/**
 * ChatWindow.js
 *
 * Container component that renders the list of chat messages and
 * displays a “Thinking…” indicator when awaiting a response.
 *
 * Props:
 * @param {Array<object>}   messages           - Array of message objects to render.
 * @param {number|null}     editIndex          - Index of the message currently being edited.
 * @param {string}          editText           - Current text value for the edit input.
 * @param {function}        setEditText        - Setter for updating the edit text.
 * @param {function}        saveEdit           - Callback to save an edited message.
 * @param {function}        cancelEdit         - Callback to cancel editing mode.
 * @param {function}        handleEdit         - Callback to enter edit mode for a message.
 * @param {function}        handleRefresh      - Callback to re-run a message (refresh).
 * @param {function}        handleCopy         - Callback to copy message text to clipboard.
 * @param {function}        handleTts          - Callback to play/stop TTS for a message.
 * @param {boolean}         ttsSupported       - Whether TTS functionality is available.
 * @param {boolean}         isSpeechPlaying    - Whether TTS is currently active.
 * @param {SpeechSynthesisUtterance|null} currentUtterance
 *                                                 - The active utterance object.
 * @param {boolean}         isThinking         - Whether the assistant is generating a response.
 */

import React from "react";
import ChatMessage from "./ChatMessage";

export default function ChatWindow({
  messages,
  editIndex,
  editText,
  setEditText,
  saveEdit,
  cancelEdit,
  handleEdit,
  handleRefresh,
  handleCopy,
  handleTts,
  ttsSupported,
  isSpeechPlaying,
  currentUtterance,
  isThinking,
}) {
  return (
    // Main scrollable container
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-4">

        {/**
         * Render each message using the ChatMessage component.
         * We pass down editing state and all relevant handlers.
         */}
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            msg={msg}
            index={index}
            editIndex={editIndex}
            editText={editText}
            setEditText={setEditText}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onEdit={handleEdit}
            onRefresh={handleRefresh}
            onCopy={handleCopy}
            onTts={handleTts}
            ttsSupported={ttsSupported}
            isSpeechPlaying={isSpeechPlaying}
            currentUtterance={currentUtterance}
          />
        ))}

        {/**
         * If the assistant is processing, show a “Thinking…” indicator
         * with a pulsing dot animation.
         */}
        {isThinking && (
          <div className="flex items-center space-x-2 justify-start">
            {/* Pulsing dot */}
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-700"></span>
            </span>

            {/* Thinking bubble */}
            <div className="max-w-lg px-4 py-2 rounded-xl shadow bg-indigo-900 text-white">
              Thinking...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
