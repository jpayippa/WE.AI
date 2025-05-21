/**
 * pages/chat.js
 *
 * Main chat page that ties together header, chat window,
 * input field, and sidebar using the useChat hook.
 *
 * Structure:
 *  1. Header with navigation & controls
 *  2. "Start Chat" button (if no chat yet)
 *  3. ChatWindow (message list + controls)
 *  4. ChatInput (message entry)
 *  5. ChatSidebar (history panel)
 *  6. Error banner
 *
 * Uses:
 *  - useChat: encapsulates all chat state and handlers.
 *  - ChatHeader: top bar with logo, history, new chat buttons.
 *  - ChatWindow: displays messages and thinking indicator.
 *  - ChatInput: input field + send button.
 *  - ChatSidebar: slide‐out panel showing past chats.
 */

import React from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import ChatSidebar from "@/components/ChatSidebar";
import useChat from "../hooks/useChat";

export default function ChatPage() {
  // Retrieve all chat state & handlers
  const chat = useChat();

  // 1. Loading state (NextAuth session check)
  if (chat.status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="
      flex flex-col h-screen
      bg-gradient-to-bl from-[#000000] via-[#150050] to-[#3f0071]
      text-white
    ">
      {/* 2. Header with logo, history toggle, new chat */}
      <ChatHeader
        onStart={chat.handleStartChat}
        onToggleHistory={chat.toggleDashboard}
        onNewChat={chat.handleNewChat}
        session={chat.session}
        router={chat.router}
      />

      {/*
        3. If no chat is active, show "Start Chat" button
           positioned just below the header.
      */}
      {!chat.chatVisible ? (
        <div className="flex justify-center mt-8 px-6">
          <button
            onClick={chat.handleStartChat}
            className="
              px-3 py-2 bg-[#3e00713a]
              text-md font-semibold rounded-lg
              shadow-[0_0_10px_#a855f7]
              hover:shadow-[0_0_40px_#a855f7]
              transition duration-300
            "
            title="Start a new chat session"
          >
            Start Chat
          </button>
        </div>
      ) : (
        /* 4. Otherwise render the chat messages window */
        <ChatWindow
          messages={chat.messages}
          editIndex={chat.editIndex}
          editText={chat.editText}
          setEditText={chat.setEditText}
          saveEdit={chat.saveEdit}
          cancelEdit={chat.cancelEdit}
          handleEdit={chat.handleEdit}
          handleRefresh={chat.handleRefresh}
          handleCopy={chat.handleCopy}
          handleTts={chat.handleTts}
          ttsSupported={chat.ttsSupported}
          isSpeechPlaying={chat.isSpeechPlaying}
          currentUtterance={chat.currentUtterance}
          isThinking={chat.isThinking}
        />
      )}

      {/*
        5. Message input at the bottom when chat is active
      */}
      {chat.chatVisible && (
        <ChatInput
          query={chat.query}
          onChange={chat.setQuery}
          onSend={() => chat.handleQuery(chat.query)}
        />
      )}

      {/*
        6. Sidebar for chat history (slides in/out)
      */}
      <ChatSidebar
        isOpen={chat.showDashboard}
        chats={chat.chats}
        editingChatId={chat.editingChatId}
        newChatTitle={chat.newChatTitle}
        onRename={chat.handleEditChatTitle}
        onDelete={chat.handleDeleteChat}
        onSelect={chat.handleChatSelection}
        setNewChatTitle={chat.setNewChatTitle}
        onClose={chat.toggleDashboard}
      />

      {/*
        7. Global error banner, if any error state is set
      */}
      {chat.error && (
        <div className="
          bg-red-100 text-red-800 p-2
          text-center text-sm mt-2 rounded-lg
        ">
          {chat.error}
        </div>
      )}
    </div>
  );
}
