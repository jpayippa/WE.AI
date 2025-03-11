import { useState, useEffect } from "react";
import { FaArrowUp, FaEdit, FaSave, FaTimes, FaSync } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";


export default function Home() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [token, setToken] = useState(""); // Store token here
  const [editIndex, setEditIndex] = useState(null); // Track the message being edited
  const [editText, setEditText] = useState(""); // Store the edited text
  const { data: session } = useSession();


  // Fetch token on page load
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

  const handleQuery = async (inputQuery = query, isRefresh = false) => {
    if (!inputQuery.trim() || !token) return;

    setError(null);

    // Append user query only if it's not a refresh
    if (!isRefresh) {
      setMessages((prev) => [...prev, { sender: "user", text: inputQuery }]);
    }

    setQuery(""); // Clear input field
    setIsThinking(true); // Show thinking indicator

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: inputQuery, token }), // Include token in the body
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch response.");
      }

      const data = await res.json();

      // Append bot response
      setMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsThinking(false); // Hide thinking indicator
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditText(messages[index].text);
  };

  const saveEdit = async () => {
    const updatedMessages = messages.slice(0, editIndex); // Keep messages above the edited one
    setMessages(updatedMessages); // Update the state to erase messages below

    // Immediately exit edit mode
    setEditIndex(null);
    setEditText("");

    // Re-send the edited prompt
    handleQuery(editText);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditText("");
  };

  const handleRefresh = async (index) => {
    const promptToRefresh = messages[index].text;
    handleQuery(promptToRefresh, true); // Regenerate the prompt response without appending it as a user query
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-bl from-[#000000] via-[#150050] to-[#3f0071] text-white">
      {/* WE.AI Logo */}
      <div className="absolute top-4 left-6">
        <h1 className="text-2xl font-extrabold font-inter bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer hover:opacity-80 transition duration-300">
          WE.AI: ALPHA
        </h1>
      </div>

      {/* Header */}
<header className="text-grey text-center py-6 relative">
  <p className="text-4xl mt-10 font-bold font-inter text-white cursor-pointer relative transition duration-300">
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 glow-hover-effect">
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
                    {msg.text}
                  </div>
                  {msg.sender === "user" && (
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-gray-400 hover:text-white"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleRefresh(index)}
                        className="text-blue-400 hover:text-white"
                      >
                        <FaSync />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-center space-x-2 justify-start">
              {/* Radar Ping Animation */}
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-700"></span>
              </span>
              {/* Thinking Text */}
              <div className="max-w-lg px-4 py-2 rounded-xl shadow bg-indigo-900 text-white">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

{/* Input Area */}
<footer className="p-4">
  <div className="max-w-3xl mx-auto flex items-center">
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Ask me anything about Engineering..."
      className="flex-1 px-4 py-2 bg-[#150050] text-white placeholder-gray-400 border border-[#3f0071] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f0071] font-inter transition duration-300 shadow focus:shadow-[0_0_10px_#800080] hover:shadow-[0_0_10px_#800080]"
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


      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-800 p-2 text-center text-sm mt-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
