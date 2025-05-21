/**
 * ChatSidebar.js
 *
 * Sidebar component listing past chats with controls to
 * select, rename, or delete a chat.
 *
 * Props:
 * @param {boolean} isOpen             - Whether the sidebar is visible.
 * @param {Array<{id: string, title: string}>} chats
 *                                       - List of chat objects.
 * @param {string|null} editingChatId  - ID of chat currently being renamed.
 * @param {string} newChatTitle        - Current value of chat title input.
 * @param {function(string): void} onSelect
 *                                       - Callback when a chat is selected.
 * @param {function(string): void} onDelete
 *                                       - Callback when a chat is deleted.
 * @param {function(string, string): void} onRename
 *                                       - Callback to toggle rename mode.
 * @param {function(string): void} setNewChatTitle
 *                                       - Setter for the rename input.
 * @param {function(): void} onClose    - Callback to close the sidebar.
 */

import React from "react";
import { FaSave, FaEdit, FaTrash } from "react-icons/fa";

export default function ChatSidebar({
  isOpen,
  chats,
  editingChatId,
  newChatTitle,
  onSelect,
  onDelete,
  onRename,
  setNewChatTitle,
  onClose,
}) {
  return (
    // Sidebar container slides in/out based on `isOpen`
    <div
      className={`
        fixed top-0 right-0 h-full w-80 bg-[#0c043c] text-white
        transform transition-transform duration-300 overflow-y-auto
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* Header with title and close button */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-6 border-b border-purple-900 pb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Chat History
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#3f0071] rounded-lg"
            title="Close sidebar"
          >
            Close
          </button>
        </div>

        {/* Chat list or empty placeholder */}
        <div className="space-y-2">
          {chats.length === 0 && (
            <p className="text-gray-400 text-center py-4">No chats found</p>
          )}

          {chats.map((chat) => (
            // Single chat entry
            <div
              key={chat.id}
              className="group p-2 hover:bg-[#3f0071] rounded-lg transition-all duration-200 relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {editingChatId === chat.id ? (
                    // Rename input field
                    <input
                      type="text"
                      value={newChatTitle}
                      onChange={(e) => setNewChatTitle(e.target.value)}
                      className="
                        w-full px-3 py-1 bg-[#150050] text-white
                        rounded-lg border border-purple-900
                        focus:outline-none focus:ring-2 focus:ring-purple-500
                      "
                      autoFocus
                      placeholder="Chat title"
                      title="Edit chat title"
                    />
                  ) : (
                    // Display chat title
                    <button
                      className="w-full text-left truncate text-purple-200 hover:text-white"
                      onClick={() => onSelect(chat.id)}
                      title="Open chat"
                    >
                      {chat.title || "New Chat"}
                    </button>
                  )}
                </div>

                {/* Rename and delete buttons (appear on hover) */}
                <div className="flex items-center space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRename(chat.id, chat.title)}
                    title={editingChatId === chat.id ? "Save title" : "Edit name"}
                  >
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
