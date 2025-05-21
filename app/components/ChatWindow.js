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
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-4">
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
        {isThinking && (
          <div className="flex items-center space-x-2 justify-start">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-700"></span>
            </span>
            <div className="max-w-lg px-4 py-2 rounded-xl shadow bg-indigo-900 text-white">
              Thinking...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
