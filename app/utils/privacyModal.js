import { FaTimes } from "react-icons/fa";

export default function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0c043c] rounded-lg p-6 max-w-2xl w-full mx-4 border border-purple-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-400">Privacy Policy</h3>
          <button 
            onClick={onClose}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] text-gray-300 space-y-4">
          <p>
            WE.AI ("the Service") is committed to protecting your privacy. This Privacy Policy 
            explains how we handle information when you use our AI chat service.
          </p>
          
          <h4 className="font-bold text-purple-300">Data Collection</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li>We store chat history to maintain conversation continuity</li>
            <li>User authentication information is handled through secure providers</li>
            <li>We collect anonymous usage data for service improvement</li>
          </ul>

          <h4 className="font-bold text-purple-300">Data Usage</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li>Chat data is used solely to provide and improve the Service</li>
            <li>We do not share personal information with third parties</li>
            <li>Aggregated statistics may be used for research purposes</li>
          </ul>

          <h4 className="font-bold text-purple-300">Security</h4>
          <p>
            We implement industry-standard security measures to protect your data, 
            including encryption and access controls.
          </p>

          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}