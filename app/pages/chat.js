import { useState, useEffect } from "react";
import {
  FaArrowUp,
  FaEdit,
  FaSave,
  FaTimes,
  FaSync,
  FaVolumeUp,
  FaHistory,
  FaTrash,
  FaCopy,
  FaHome
} from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatMessage } from "../utils/format";
import { speakText, stopSpeaking } from "../utils/tts";
// Add updateChatTitle to your existing import
import {
  createUserIfNotExists,
  createNewChat,
  saveMessage,
  fetchChatMessages,
  getLatestChatId,
  getAllChatDocs,
  deleteChat,
  updateChatTitle, // Add this
} from "@/utils/historyHelper";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [token, setToken] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [currentChat, setCurrentChat] = useState("test");
  const { data: session, status } = useSession();
  const [chatVisible, setChatVisible] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [chats, setChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatTitle, setNewChatTitle] = useState("");

  const router = useRouter();

  const handleStartChat = async () => {
    setChatVisible(true);
    const startChat = await createNewChat(session.user.email);
    setCurrentChat(startChat);
  };
  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Optional: Display feedback to the user
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
        setError("Failed to copy text to clipboard");
      });
  };

  const toggleDashboard = (userId) => {
    setShowDashboard((prev) => !prev);
    const fetchChats = async () => {
      const chatList = await getAllChatDocs(session.user.email);
      setChats(chatList);
    };
    fetchChats();
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      const success = await deleteChat(session.user.email, chatId);
      if (success) {
        // Update local state
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));

        // Handle current chat deletion
        if (currentChat === chatId) {
          setMessages([]);
          setCurrentChat(null);
          setChatVisible(false);
        }
      }
    }
  };
  const handleEditChatTitle = async (chatId, currentTitle) => {
    if (editingChatId === chatId) {
      const trimmedTitle = newChatTitle.trim();
      if (trimmedTitle && trimmedTitle !== currentTitle) {
        const success = await updateChatTitle(
          session.user.email,
          chatId,
          trimmedTitle
        );
        if (success) {
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatId ? { ...chat, title: trimmedTitle } : chat
            )
          );
        }
      }
      setEditingChatId(null);
      setNewChatTitle("");
    } else {
      setEditingChatId(chatId);
      setNewChatTitle(currentTitle);
    }
  };

  const handleChatSelection = (chatId) => {
    //console.log("Selected Chat ID:", chatId); // Debugging
    setCurrentChat(chatId); // Update the state to switch the chat
    setShowDashboard(false);
    setChatVisible(true);

    const loadChat = async () => {
      const fetchedMessages = await fetchChatMessages(
        session.user.email,
        chatId
      );
      const messagesArray = Object.keys(fetchedMessages).map((key) => ({
        id: key,
        sender: fetchedMessages[key].sender,
        text: fetchedMessages[key].content,
        timestamp: fetchedMessages[key].timestamp, // Optional for sorting
      }));

      // Sort messages by timestamp (if timestamps exist)
      messagesArray.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
      setMessages(messagesArray); // Populate chat UI
    };

    loadChat();
  };

  const handleNewChat = async () => {
    setMessages([]);
    setChatVisible(true);
    const newChat = await createNewChat(session.user.email);
    setCurrentChat(newChat);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setTtsSupported(false);
      setError("Text-to-speech not supported in this browser");
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/landing");
    } else {
      createUserIfNotExists(session.user.email); // history
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(
          "https://us-central1-we-ai-442218.cloudfunctions.net/generateToken"
        );
        const result = await response.json();
        setToken(result.token);
      } catch (err) {
        console.error("Error fetching token:", err);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleTts = (text) => {
    if (isSpeechPlaying && currentUtterance?.text === text) {
      stopSpeaking();
      setIsSpeechPlaying(false);
    } else {
      stopSpeaking();
      const utterance = speakText(
        text,
        () => setIsSpeechPlaying(true),
        () => setIsSpeechPlaying(false)
      );
      utterance.text = text;
      setCurrentUtterance(utterance);
    }
  };

  const handleQuery = async (
    inputQuery = query,
    isRefresh = false,
    refreshIndex = -1,
    customHistory = null
  ) => {
    if (!inputQuery.trim() || !token) return;
    setError(null);

    let updatedHistory;
    if (isRefresh) {
      updatedHistory = customHistory || messages.slice(0, refreshIndex + 1);
      if (!customHistory) {
        setMessages(updatedHistory);
      }
    } else {
      updatedHistory = [...messages, { sender: "user", text: inputQuery }];
      setMessages(updatedHistory);
      saveMessage(session.user.email, currentChat, "user", inputQuery); //history
    }

    setQuery("");
    setIsThinking(true);

    try {
      const res = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: inputQuery,
          token,
          conversationHistory: updatedHistory.map((msg) => ({
            role: msg.sender,
            content: msg.text,
          })),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch response.");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
      saveMessage(session.user.email, currentChat, "bot", data.response);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsThinking(false);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditText(messages[index].text);
  };

  const saveEdit = async () => {
    const updatedMessages = [
      ...messages.slice(0, editIndex),
      { ...messages[editIndex], text: editText },
      ...messages.slice(editIndex + 1),
    ];
    const truncatedMessages = updatedMessages.slice(0, editIndex + 1);

    setMessages(truncatedMessages);
    setEditIndex(null);
    setEditText("");

    handleQuery(editText, true, editIndex, truncatedMessages);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditText("");
  };

  const handleRefresh = async (index) => {
    const promptToRefresh = messages[index].text;
    handleQuery(promptToRefresh, true, index);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-bl from-[#000000] via-[#150050] to-[#3f0071] text-white">
      {/* WE.AI Logo */}
      <div className="absolute top-4 left-6">
        <h1 className="text-2xl font-extrabold font-inter bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600 cursor-pointer hover:opacity-80 transition duration-300">
          WE.AI: ALPHA
        </h1>
      </div>

      {/* Header */}
      <header className="text-grey text-center py-6 relative">
        <p className="text-4xl mt-10 font-bold font-inter text-white cursor-pointer relative transition duration-300">
          <span className="text-transparent bg-clip-text bg-gradient-to-r  from-purple-500 to-indigo-600 glow-hover-effect">
            Your Western Engineering AI Assistant.
          </span>
        </p>
        <p className="text-xs mt-2 font-bold font-inter text-white cursor-pointer hover:text-purple-400 transition duration-300">
          made by Western Software Engineering Students
        </p>

        {/* Top Right User Profile & Logout */}
        <div className="absolute top-4 right-6 flex items-center space-x-4">
          {session ? (
            <>
                  <FaHome
                  onClick={() => router.push("/landing")}
                  className="w-7 h-7 hover:fill-purple-400 cursor-pointer"
                  title="Home"
                />
              <FaHistory
                onClick={() => toggleDashboard()}
                className="w-7 h-7 hover:fill-purple-400"
              />
              <FaPenToSquare
                onClick={() => handleNewChat()}
                className="w-7 h-7 hover:fill-purple-400"
              />
              <img
                src={session.user.image}
                alt="User Profile"
                className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
              />
              <button
                onClick={() => signOut()}
                className="bg-[#3f0071] text-white font-semibold px-4 py-2 rounded-full shadow-lg focus:shadow-[0_0_10px_#800080] hover:shadow-[0_0_10px_#800080] focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center justify-center transition duration-300"
              >
                Sign Out
              </button>
            </>
          ) : null}
        </div>
      </header>

      {/* Chat Area */}
      {!chatVisible ? (
        <div>
          <div className="flex items-center justify-center">
            <button
              onClick={handleStartChat}
              className="px-3 py-2 bg-[#3e00713a] text-md font-semibold rounded-lg shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_40px_#a855f7] transition duration-300"
            >
              Start Chat
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } group`}
              >
                {editIndex === index ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-4 py-2 bg-[#150050] text-white placeholder-gray-400 border border-[#3f0071] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f0071] font-inter"
                    />
                    <button onClick={saveEdit} className="text-green-500">
                      <FaSave />
                    </button>
                    <button onClick={cancelEdit} className="text-red-500">
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div
                      className={`max-w-lg px-4 py-2 rounded-xl shadow ${
                        msg.sender === "user"
                          ? "bg-[#3f0071] text-white"
                          : "bg-indigo-900 text-white"
                      }`}
                    >
                      {msg.sender === "bot" ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formatMessage(msg.text),
                          }}
                        />
                      ) : (
                        msg.text
                      )}
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {msg.sender === "user" ? (
                        <>
                          <button
                            onClick={() => handleEdit(index)}
                            className="text-gray-400 hover:text-white"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleRefresh(index)}
                            className="text-blue-400 hover:text-white"
                            title="Refresh"
                          >
                            <FaSync />
                          </button>
                          <button
                            onClick={() => handleCopy(msg.text)}
                            className="text-purple-400 hover:text-purple-300"
                            title="Copy"
                          >
                            <FaCopy />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleCopy(msg.text)}
                            className="text-purple-400 hover:text-purple-300"
                            title="Copy"
                          >
                            <FaCopy />
                          </button>
                          {ttsSupported && (
                            <button
                              onClick={() => handleTts(msg.text)}
                              className={`${
                                isSpeechPlaying &&
                                currentUtterance?.text === msg.text
                                  ? "text-purple-300"
                                  : "text-purple-400"
                              } hover:text-purple-300`}
                              title={
                                isSpeechPlaying &&
                                currentUtterance?.text === msg.text
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
                )}
              </div>
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
      )}
      {!chatVisible ? (
        <div></div>
      ) : (
        <footer className="p-4">
          <div className="max-w-3xl mx-auto flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about Engineering..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleQuery(query);
                }
              }}
              className="flex-1 px-4 py-2 bg-[#150050] text-white border border-[#3f0071] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f0071] font-inter transition duration-300 shadow focus:shadow-[0_0_10px_#800080] hover:shadow-[0_0_10px_#800080]
          placeholder:text-transparent 
          placeholder:bg-gradient-to-r 
          placeholder:from-pink-400 
          placeholder:via-purple-400 
          placeholder:to-purple-500 
          placeholder:bg-clip-text"
            />
            <button
              onClick={() => handleQuery(query)}
              className="ml-4 px-4 py-3 bg-[#3f0071] text-white font-semibold rounded-full shadow-lg focus:shadow-[0_0_10px_#800080] hover:shadow-[0_0_10px_#800080] focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center justify-center transition duration-300"
            >
              <FaArrowUp className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-center mt-4 font-inter text-gray-500">
            WE.AI can make mistakes. Check{" "}
            <a href="https://eng.uwo.ca" className="underline">
              eng.uwo.ca
            </a>{" "}
            to fact check.
          </p>
        </footer>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-800 p-2 text-center text-sm mt-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Side Dashboard */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#0c043c] text-white transform transition-transform duration-300 overflow-y-auto
        ${showDashboard ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6 border-b border-purple-900 pb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600  bg-clip-text text-transparent">
              Chat History
            </h2>
            <button
              onClick={toggleDashboard}
              className="px-3 py-1 bg-[#3f0071] text-white  font-semibold rounded-lg shadow-lg transition duration-300 hover:bg-purple-700"
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            {chats.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No chats found</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className="group relative p-2 hover:bg-[#3f0071] rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center min-w-0">
                      {editingChatId === chat.id ? (
                        <input
                          type="text"
                          value={newChatTitle}
                          onChange={(e) => setNewChatTitle(e.target.value)}
                          className="flex-1 px-3 py-1 bg-[#150050] text-white rounded-lg border border-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                      ) : (
                        <button
                          className="w-full text-left p-2 truncate text-purple-200 hover:text-white transition-colors"
                          onClick={() => handleChatSelection(chat.id)}
                        >
                          {chat.title || "New Chat"}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => handleEditChatTitle(chat.id, chat.title)}
                        className="p-1.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-purple-300 hover:bg-purple-900 rounded-lg"
                        title="Edit chat name"
                      >
                        {editingChatId === chat.id ? (
                          <FaSave className="w-4 h-4" />
                        ) : (
                          <FaEdit className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteChat(chat.id)}
                        className="p-1.5 text-pink-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-pink-400 hover:bg-purple-900 rounded-lg"
                        title="Delete chat"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
