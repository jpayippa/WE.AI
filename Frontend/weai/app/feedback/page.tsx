"use client"
import Link from "next/link";
import { useState } from "react";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  try {
    const send = await fetch("https://us-central1-we-ai-442218.cloudfunctions.net/sendFeedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "email": `${formData.email}`,
        "feedback": `${formData.message}`,
      })
    })

    setFormData({
      email: "",
      message: "",
    });

    const res = await send.json();
    window.alert(res.message)
  } catch (error) {
    window.alert("error")
  }



  };

  return (
    
    <div className="flex flex-col h-screen bg-[#2e1065]">
        <div className="sticky top-0 w-full p-4 bg-white overflow-hidden shadow-xl">
            <h1 className="text-xl text-left font-extrabold font-leading-none tracking-tight text-gray-900 md:text-xl lg:text-2xl dark:text-[#2e1065]">
              <Link href="/">WE.AI</Link>
            </h1>
        </div>
        <div className="flex flex-col items-center justify-center h-screen px-4 overflow-auto"> 
            <div className="w-full max-w-screen bg-white shadow-md rounded-lg p-8">
                <h1 className="text-2xl font-bold text-center text-[#2e1065] mb-6">
                FEEDBACK FORM
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full p-3 border text-[#2e1065] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#672ad8]"
                    required
                    />
                </div>
                <div>
                    <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Message"
                    rows={4}
                    className="w-full p-3 border text-[#000000] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#672ad8]"
                    required
                    />
                </div>
                <div>
                    <button
                    type="submit"
                    className="w-full bg-[#2e1065] text-white py-2 rounded-md hover:bg-[#672ad8] transition"
                    >
                    SUBMIT
                    </button>
                </div>
                </form>
            </div>
        </div>
        <div className="flex justify-left top-0 w-full p-4 bg-[#180738] overflow-hidden">
            <p className="text-md text-left mr-4 font-regular font-leading-none tracking-tight text-gray-900 md:text-md lg:lg dark:text-[#ffffff]">
              <Link href="/feedback">Feedback</Link>
            </p>
            <p className="text-md text-left font-regular font-leading-none tracking-tight text-gray-900 md:text-md lg:lg dark:text-[#ffffff]">
              <Link href="/termsofservice">Terms of Service</Link>
            </p>
          </div>
    </div>
  );
};

export default FeedbackForm;
