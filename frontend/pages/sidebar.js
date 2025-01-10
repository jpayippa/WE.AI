export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
    return (
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#150050] shadow-lg transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 bg-[#3f0071]">
          <h2 className="text-lg font-bold font-inter">Saved Chats</h2>
          <button
            className="text-white hover:text-gray-300 focus:outline-none"
            onClick={() => setIsSidebarOpen(false)}
          >
            Close
          </button>
        </div>
        <div className="p-4 space-y-4 font-inter">
          {/* Placeholder for Saved Chats */}
          <button className="w-full text-left px-4 py-2 bg-indigo-900 rounded-lg shadow hover:bg-[#3f0071]">
            Chat 1
          </button>
          <button className="w-full text-left px-4 py-2 bg-indigo-900 rounded-lg shadow hover:bg-[#3f0071]">
            Chat 2
          </button>
          <button className="w-full text-left px-4 py-2 bg-indigo-900 rounded-lg shadow hover:bg-[#3f0071]">
            Chat 3
          </button>
        </div>
      </div>
    );
  }
  