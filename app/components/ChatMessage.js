import React from "react";
import { FaEdit, FaSync, FaCopy, FaVolumeUp, FaSave, FaTimes } from "react-icons/fa";
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
  const isUser = msg.sender === "user";
  const isEditing = editIndex === index;

  if (isEditing) {
    return (
      <div className="flex justify-end group space-x-2">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="flex-1 px-4 py-2 bg-[#150050] text-white rounded-lg border border-[#3f0071] focus:outline-none focus:ring-2 focus:ring-[#3f0071]"
        />
        <button onClick={onSaveEdit} className="text-green-500" title="Save">
          <FaSave />
        </button>
        <button onClick={onCancelEdit} className="text-red-500" title="Cancel">
          <FaTimes />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div className="flex items-center space-x-2">
        <div
          className={`max-w-lg px-4 py-2 rounded-xl shadow ${
            isUser ? "bg-[#3f0071] text-white" : "bg-indigo-900 text-white"
          }`}
        >
          {msg.sender === "bot" ? (
            <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
          ) : (
            msg.text
          )}
        </div>

        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isUser ? (
            <>
              <button
                onClick={() => onEdit(index)}
                className="text-gray-400 hover:text-white"
                title="Edit"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onRefresh(index)}
                className="text-blue-400 hover:text-white"
                title="Refresh"
              >
                <FaSync />
              </button>
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
              <button
                onClick={() => onCopy(msg.text)}
                className="text-purple-400 hover:text-purple-300"
                title="Copy"
              >
                <FaCopy />
              </button>
              {ttsSupported && (
                <button
                  onClick={() => onTts(msg.text)}
                  className={`${
                    isSpeechPlaying && currentUtterance?.text === msg.text
                      ? "text-purple-300"
                      : "text-purple-400"
                  } hover:text-purple-300`}
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
