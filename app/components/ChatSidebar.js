import React from "react";
import { FaSave, FaEdit, FaTrash } from "react-icons/fa";

export default function ChatSidebar({
  isOpen, chats, editingChatId, newChatTitle,
  onSelect, onDelete, onRename, setNewChatTitle, onClose
}) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-[#0c043c] text-white transform transition-transform duration-300 overflow-y-auto ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6 border-b border-purple-900 pb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Chat History
          </h2>
          <button onClick={onClose} className="px-3 py-1 bg-[#3f0071] rounded-lg">
            Close
          </button>
        </div>
        <div className="space-y-2">
          {chats.length === 0 && <p className="text-gray-400 text-center py-4">No chats found</p>}
          {chats.map(chat => (
            <div key={chat.id} className="group p-2 hover:bg-[#3f0071] rounded-lg transition-all duration-200 relative">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={newChatTitle}
                      onChange={e => setNewChatTitle(e.target.value)}
                      className="w-full px-3 py-1 bg-[#150050] text-white rounded-lg border border-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                  ) : (
                    <button
                      className="w-full text-left truncate text-purple-200 hover:text-white"
                      onClick={() => onSelect(chat.id)}
                    >
                      {chat.title || "New Chat"}
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onRename(chat.id, chat.title)} title="Edit name">
                    {editingChatId === chat.id ? <FaSave /> : <FaEdit />}
                  </button>
                  <button onClick={() => onDelete(chat.id)} title="Delete chat">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
