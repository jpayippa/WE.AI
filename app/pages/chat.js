import ChatHeader from "@/components/ChatHeader";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import ChatSidebar from "@/components/ChatSidebar";
import useChat from "../hooks/useChat";

export default function ChatPage() {
  const chat = useChat();

  if (chat.status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-bl from-[#000000] via-[#150050] to-[#3f0071] text-white">
      <ChatHeader
        onStart={chat.handleStartChat}
        onToggleHistory={chat.toggleDashboard}
        onNewChat={chat.handleNewChat}
        session={chat.session}
        router={chat.router}
      />

    {!chat.chatVisible ? (
      <div className="flex justify-center mt-8 px-6">
        <button
          onClick={chat.handleStartChat}
          className="px-3 py-2 bg-[#3e00713a] text-md font-semibold rounded-lg shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_40px_#a855f7] transition duration-300"
        >
          Start Chat
        </button>
      </div>
      ) : (
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

      {chat.chatVisible && (
        <ChatInput
          query={chat.query}
          onChange={chat.setQuery}
          onSend={() => chat.handleQuery(chat.query)}
        />
      )}

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

      {chat.error && (
        <div className="bg-red-100 text-red-800 p-2 text-center text-sm mt-2 rounded-lg">
          {chat.error}
        </div>
      )}
    </div>
  );
}
