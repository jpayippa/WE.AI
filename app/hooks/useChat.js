import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { speakText, stopSpeaking } from "@/utils/tts";

export default function useChat() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
  const [currentChat, setCurrentChat] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [chats, setChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatTitle, setNewChatTitle] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) return router.push("/landing");
    createUserIfNotExists(session.user.email);
  }, [session, status]);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
      setError("Text-to-speech not supported");
    }
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("https://us-central1-we-ai-442218.cloudfunctions.net/generateToken");
        const j = await res.json();
        setToken(j.token);
      } catch {}
    };
    fetchToken();
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  const handleStartChat = async () => {
    setChatVisible(true);
    const id = await createNewChat(session.user.email);
    setCurrentChat(id);
  };

  const toggleDashboard = () => {
    setShowDashboard(v => !v);
    getAllChatDocs(session.user.email).then(setChats);
  };

  const handleDeleteChat = async id => {
    if (confirm("Delete this chat?")) {
      const ok = await deleteChat(session.user.email, id);
      if (ok) setChats(cs => cs.filter(c => c.id !== id));
      if (currentChat === id) {
        setChatVisible(false);
        setMessages([]);
      }
    }
  };

  const handleEditChatTitle = async (id, currentTitle) => {
    if (editingChatId === id) {
      const t = newChatTitle.trim();
      if (t && t !== currentTitle) {
        const ok = await updateChatTitle(session.user.email, id, t);
        if (ok) setChats(cs => cs.map(c => c.id === id ? { ...c, title: t } : c));
      }
      setEditingChatId(null);
      setNewChatTitle("");
    } else {
      setEditingChatId(id);
      setNewChatTitle(currentTitle);
    }
  };

  const handleChatSelection = id => {
    setCurrentChat(id);
    setChatVisible(true);
    setShowDashboard(false);
    fetchChatMessages(session.user.email, id).then(fetched => {
      const arr = Object.entries(fetched).map(([k,v]) => ({
        id: k,
        sender: v.sender,
        text: v.content,
        timestamp: v.timestamp
      }));
      arr.sort((a,b) => a.timestamp > b.timestamp ? 1 : -1);
      setMessages(arr);
    });
  };

  const handleCopy = text => {
    navigator.clipboard.writeText(text).catch(() => setError("Copy failed"));
  };

  const handleTts = text => {
    if (isSpeechPlaying && currentUtterance?.text === text) {
      stopSpeaking();
      setIsSpeechPlaying(false);
    } else {
      stopSpeaking();
      const u = speakText(text, () => setIsSpeechPlaying(true), () => setIsSpeechPlaying(false));
      u.text = text;
      setCurrentUtterance(u);
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
        const toDel = messages.slice(refreshIndex + 1).map(m => m.id);
        if (toDel.length) await deleteMessages(session.user.email, currentChat, toDel);
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
          conversationHistory: updatedHistory.map(m => ({
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
      setMessages(prev => [...prev, { sender: "bot", text: response }]);
      saveMessage(session.user.email, currentChat, "bot", response);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsThinking(false);
    }
  };

  const handleEdit = idx => {
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
  const cancelEdit = () => setEditIndex(null) || setEditText("");
  const handleRefresh = idx => handleQuery(messages[idx].text, true, idx);

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
    handleStartChat,
    toggleDashboard,
    handleNewChat: handleStartChat,
    handleDeleteChat,
    handleEditChatTitle,
    handleChatSelection,
    handleQuery,
    router,
    setNewChatTitle,
  };
}
