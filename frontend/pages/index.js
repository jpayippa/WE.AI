import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [token, setToken] = useState(""); // Store token here

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

  const handleQuery = async () => {
    if (!query.trim() || !token) return;

    setError(null);

    // Append user query
    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setQuery(""); // Clear input field
    setIsThinking(true); // Show thinking indicator

    try {
      const res = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, token }), // Include token in the body
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-bl from-[#000000] via-[#150050] to-[#3f0071] text-white">
      {/* WE.AI Logo */}
      <div className="absolute top-4 left-6">
        <h1 className="text-2xl font-extrabold font-inter text-white cursor-pointer hover:text-purple-400 transition duration-300">
          WE.AI: ALPHA
        </h1>
      </div>

      {/* Header */}
      <header className="text-grey text-center py-6">
        <p className="text-md mt-10 font-bold font-inter text-white cursor-pointer hover:text-purple-400 transition duration-300">
          Your personal Western Engineering AI Assistant made by Western Engineering Students 🛠️
        </p>
        <p className="text-xs mt-2 font-bold font-inter text-white cursor-pointer hover:text-purple-400 transition duration-300">
          For any inquiries please contact: westernaicontact@gmail.com ✉️
        </p>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-lg px-4 py-2 rounded-xl shadow ${
                  msg.sender === "user"
                    ? "bg-[#3f0071] text-white"
                    : "bg-indigo-900 text-white"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-center space-x-2 justify-start">
              {/* Spinner */}
              <div className="w-4 h-4 border-2 border-[#3f0071] border-t-transparent rounded-full animate-spin"></div>
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
            onClick={handleQuery}
            className="ml-4 px-4 py-3 bg-[#3f0071] text-white font-semibold rounded-full shadow-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center justify-center"
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