/**
 * useChat.js
 *
 * Custom React hook encapsulating all chat-related state, side effects,
 * and handlers for the WE.AI chat page.
 *
 * Returns an object containing:
 *  - session, status           : NextAuth session state
 *  - messages                  : Array of message objects ({ id, sender, text, timestamp })
 *  - query, setQuery           : Current user input and setter
 *  - error                     : String error message, if any
 *  - isThinking                : Boolean flag while awaiting AI response
 *  - editIndex, editText, setEditText
 *                             : Editing state for in-place message edits
 *  - saveEdit, cancelEdit      : Handlers to commit or cancel an edit
 *  - handleEdit, handleRefresh : Handlers to initiate edit or re-run a message
 *  - handleCopy                : Copy text to clipboard
 *  - handleTts                 : Play/stop text-to-speech on a message
 *  - ttsSupported              : Whether browser TTS is available
 *  - isSpeechPlaying, currentUtterance
 *                             : TTS playback state & utterance object
 *  - chatVisible               : Whether the chat window is open
 *  - showDashboard             : Sidebar history panel visibility
 *  - chats                     : List of chat session metadata
 *  - editingChatId, newChatTitle, setNewChatTitle
 *                             : State for renaming chat sessions
 *  - handleStartChat, handleNewChat
 *                             : Create a new chat session
 *  - toggleDashboard           : Show/hide chat history sidebar
 *  - handleDeleteChat          : Delete a chat session
 *  - handleEditChatTitle       : Enter/save chat rename mode
 *  - handleChatSelection       : Load messages for a selected chat
 *  - handleQuery               : Send user query to AI backend
 *  - router                    : Next.js router for navigation
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// History helper utilities for Firestore operations
import {
  createUserIfNotExists,
  createNewChat,
  saveMessage,
  fetchChatMessages,
  getAllChatDocs,
  deleteChat,
  updateChatTitle,
  deleteMessages,
} from "@/utils/historyHelper";

// Text-to-speech utilities
import { speakText, stopSpeaking } from "@/utils/tts";

export default function useChat() {
  // NextAuth session and router
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- Local state declarations ---
  const [messages, setMessages] = useState([]);          // Chat messages
  const [query, setQuery] = useState("");                // User input
  const [error, setError] = useState(null);              // Error message
  const [isThinking, setIsThinking] = useState(false);   // Awaiting AI response
  const [token, setToken] = useState("");                // AI service auth token

  // Edit-in-place state
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");

  // TTS state
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);

  // Chat session & UI visibility
  const [currentChat, setCurrentChat] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Chat history list & rename state
  const [chats, setChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatTitle, setNewChatTitle] = useState("");

  // --- Side effects ---

  // 1. Ensure user is signed in & create user record
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/landing");
    } else {
      createUserIfNotExists(session.user.email);
    }
  }, [session, status, router]);

  // 2. Detect TTS support in the browser
  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
      setError("Text-to-speech not supported");
    }
  }, []);

  // 3. Fetch AI auth token on mount
  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch(
          "https://us-central1-we-ai-442218.cloudfunctions.net/generateToken"
        );
        const { token } = await res.json();
        setToken(token);
      } catch {
        // Fail silently; token-dependent calls will noop
      }
    }
    fetchToken();
  }, []);

  // 4. Cleanup any active TTS on unmount
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // --- Handlers ---

  /**
   * Start a brand new chat session.
   */
  const handleStartChat = async () => {
    setChatVisible(true);
    const id = await createNewChat(session.user.email);
    setCurrentChat(id);
  };

  /**
   * Toggle the chat history sidebar.
   */
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    getAllChatDocs(session.user.email).then(setChats);
  };

  /**
   * Delete a chat session after user confirmation.
   */
  const handleDeleteChat = async (id) => {
    if (confirm("Delete this chat?")) {
      const ok = await deleteChat(session.user.email, id);
      if (ok) {
        setChats((cs) => cs.filter((c) => c.id !== id));
        if (currentChat === id) {
          setChatVisible(false);
          setMessages([]);
        }
      }
    }
  };

  /**
   * Enter or save chat rename mode.
   */
  const handleEditChatTitle = async (id, currentTitle) => {
    if (editingChatId === id) {
      const trimmed = newChatTitle.trim();
      if (trimmed && trimmed !== currentTitle) {
        const ok = await updateChatTitle(session.user.email, id, trimmed);
        if (ok) {
          setChats((cs) =>
            cs.map((c) => (c.id === id ? { ...c, title: trimmed } : c))
          );
        }
      }
      setEditingChatId(null);
      setNewChatTitle("");
    } else {
      setEditingChatId(id);
      setNewChatTitle(currentTitle);
    }
  };

  /**
   * Load messages for a selected chat session.
   */
  const handleChatSelection = (id) => {
    setCurrentChat(id);
    setChatVisible(true);
    setShowDashboard(false);

    fetchChatMessages(session.user.email, id).then((fetched) => {
      const arr = Object.entries(fetched).map(([key, v]) => ({
        id: key,
        sender: v.sender,
        text: v.content,
        timestamp: v.timestamp,
      }));
      arr.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
      setMessages(arr);
    });
  };

  /**
   * Copy text to clipboard, update error on failure.
   */
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => setError("Copy failed"));
  };

  /**
   * Toggle text-to-speech playback for a message.
   */
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

  /**
   * Send a new user query or re-run a previous one.
   * @param {string} inputQuery       - Text to send.
   * @param {boolean} isRefresh       - Whether this is a refresh action.
   * @param {number} refreshIndex     - Index to refresh from.
   * @param {Array} customHistory     - Optional custom history slice.
   */
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
        const toDelete = messages.slice(refreshIndex + 1).map((m) => m.id);
        if (toDelete.length) {
          await deleteMessages(
            session.user.email,
            currentChat,
            toDelete
          );
        }
        setMessages(updatedHistory);
      }
    } else {
      updatedHistory = [...messages, { sender: "user", text: inputQuery }];
      setMessages(updatedHistory);
      saveMessage(session.user.email, currentChat, "user", inputQuery);
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
          conversationHistory: updatedHistory.map((m) => ({
            role: m.sender,
            content: m.text,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch response.");
      }
      const { response } = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: response }]);
      saveMessage(session.user.email, currentChat, "bot", response);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsThinking(false);
    }
  };

  // --- Edit handlers ---
  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditText(messages[idx].text);
  };
  const saveEdit = () => {
    const updated = [
      ...messages.slice(0, editIndex),
      { ...messages[editIndex], text: editText },
      ...messages.slice(editIndex + 1),
    ];
    const truncated = updated.slice(0, editIndex + 1);
    setMessages(truncated);
    setEditIndex(null);
    setEditText("");
    handleQuery(editText, true, editIndex, truncated);
  };
  const cancelEdit = () => {
    setEditIndex(null);
    setEditText("");
  };
  const handleRefresh = (idx) => handleQuery(messages[idx].text, true, idx);

  // --- Return all state & handlers ---
  return {
    session,
    status,
    messages,
    query,
    setQuery,
    error,
    isThinking,
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
    chatVisible,
    showDashboard,
    chats,
    editingChatId,
    newChatTitle,
    setNewChatTitle,
    handleStartChat,
    handleNewChat: handleStartChat,
    toggleDashboard,
    handleDeleteChat,
    handleEditChatTitle,
    handleChatSelection,
    handleQuery,
    router,
  };
}
