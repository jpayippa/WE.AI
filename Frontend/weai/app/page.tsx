"use client"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Home() {

  const [messages, setMessages] = useState<{ user: boolean; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [token, setToken] = useState("")
  const chatContainerRef = useRef<HTMLDivElement | null>(null);  // Type assertion here

  // useEffect(() => {
  //   // Fetch API on component mount
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch('https://us-central1-we-ai-442218.cloudfunctions.net/generateToken');
  //       if (!response.ok) throw new Error('Failed to fetch data');
  //       const result = await response.json();
  //       setToken(result.token)
  //       console.log(token)
  //     } catch (err) {
  //       console.log(err)
  //     }
  //   }
  //   fetchData();
  // }, [])  // Empty dependency array = runs once on mount

  // const getToken = async () => {
  //   const auth = new GoogleAuth({
  //     keyFilename: '/Users/saif/Library/Mobile Documents/com~apple~CloudDocs/Synced Documents/University/Year 4/CAPSTONE PROJECT/WE.AI/Frontend/weai/app/utils/we-ai-442218-9d855ae58977.json', 
  //     scopes: ['https://www.googleapis.com/auth/cloud-platform'], // Adjust scopes as needed
  //   });
  //   const client = await auth.getClient();
  //   const tk = await client.getAccessToken();
  //   console.log(tk)
  // }


  // const handleGetToken = async () => {
  //   try {
  //     const response = await fetch('/api/tokenGen');
  //     const data = await response.json();
  //     setToken(data.token);
  //   } catch (error) {
  //     console.error('Error fetching token:', error);
  //   }
  // };

  // useEffect(() => {
  //   handleGetToken()
  // }, [])


  const handleSend = async () => {
    if (!input.trim()) return;
  
    // Add user's message
    setMessages((prev) => [...prev, { user: true, text: input }]);
  
    const userMessage = input;
    setInput("");  // Clear input immediately for better UX
  
    try {
      // Simulate loading message
      setMessages((prev) => [
        ...prev,
        { user: false, text: "Thinking..." },
      ]);
  
      // API call to get chatbot response
      const response = await fetch("https://us-central1-dialogflow.googleapis.com/v3/projects/we-ai-442218/locations/us-central1/agents/6e63cb11-8f42-4c9a-9f2c-fe3e0b41ccdd/sessions/2a7f4c12-987b-4b25-a7d6-e53b2a94c92d:detectIntent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer ya29.c.c0ASRK0GZ3_vf9PykZ_7QxeMV4QqRrqEBq9ooI5kNcJvIlC7Cl7zi4tpcS6i_fdOArJuLB8I0Q_wz9-5lX20Fm-nS9VDe1EcsOJojAQwGSgJ9RS0drpqq5AjV8739yK1LPFQSImYlJVFQTG09_1NI0NWSxY0rcmC30oif5oBkX6EL2eD2VhWQiLU45ICBuvffvGl9FWF9hXLAWuNzqmtTZX5SCrLtWJPTbz01e1cjsdzPWEuBoZZpzXDNtAYTayBXseCbTLp19XBj0hX6us0EGyodxqiBcs6ytvrDeB-QpwMAkBksGJupQpjDGYV5k3qhYsxo0Svx210EpGaNQFrp3PM4v9ryO-tRIBYeLZPsWSW9O1-_EKKjjrxEL384De_YzI1QlfkpoW4X7eIbJS_dxtp1j5qJvxwrjFUYII51Ufd_i_ZqYMik-va43mz1R7geRdXbi7f8ZUZyyMQOx2nXzSUbsMZUOjdz7s4fQO1YO2JcmQV3tmvMdMYhVszow64JBlOm7p5kOw2YxlloOVjO_0qajmQFrfvph8qdOVb5onVwQxW-96ItWUuQhh83eU2o3tme23yUtuZbRMdo5qVojg8y99nRo3nFl3lFOnWpaSvQX-t63u4XRit9jgjktM878l2xgZ9m9Bus8YnZmdbmOoVuq128SlF6sSirtsvx539qRWtdmzrl8jkipBY72r1SB1k-I7J019_6kQy9W41wuVcFurlzhRjUV4_dgvB5IU-tvVfsdr8plUXjetZvhth8goQveO-64YyBt5nnZIt2fbm7R51pdn8jcO18tR1vm9eMjIcdYM2Q65j50BiZ537ReQhF59JY1goxUpnhuF9um_Q3zrjeZrchJvX94j1_rfZevoRsRsOQ8r5QiaiitUtsdVO8k5xvRpb_rzWFR16jaQBcjZY9pFon2xqj40wvszzaoSp09rBavQ6tz_F3Xo3Is-byOv7tXl3vtyam5BpZm5JdlQRVFFdv7ccbMf9Ou3fkeW2QnvOOmykR",
        },
        body: JSON.stringify({
          queryInput: {
            text: {
              text: `${userMessage}`
            },
            languageCode: "en"
          }
        }),
      });
  
      const data = await response.json();
      console.log(data);
      console.log(data.queryResult.responseMessages[0].text.text[0]);

      setMessages((prev) => [
        ...prev.slice(0, -1),  
        { user: false, text: `${data.queryResult.responseMessages[0].text.text[0]}`},
      ]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),  
        { user: false, text: "Sorry, something went wrong. Please try again." },
      ]);
    }

  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);



  return (
    
    <div className="flex flex-col h-screen bg-[#2e1065]">
      <div className="sticky top-0 w-full p-4 bg-white overflow-hidden shadow-xl">
        <h1 className="text-xl text-left font-extrabold font-leading-none tracking-tight text-gray-900 md:text-xl lg:text-2xl dark:text-[#2e1065]">
          <Link href="/">WE.AI</Link>
        </h1>
      </div>
      <div className="flex flex-col w-full bg-[#2e1065] items-center rounded-lg overflow-hidden p-4"> 
        <h1 className="mb-4 mt-4 text-xl text-center font-extrabold font- leading-none  tracking-tight text-gray-900 md:text-xl lg:text-2xl dark:text-white">Welcome to WE.AI</h1>
        <p className="mb-4 text-xl text-center text-wrap font-regular leading-none  tracking-tight text-gray-900 md:text-m lg:text-l dark:text-white">Ask anything about Western Engineering. We're here to help you navigate resources, answer questions, and more!</p>
      </div>
        <div className="flex flex-col w-full h-full overflow-y-auto scroll-auto p-4">
          <div className="flex flex-col w-full h-full bg-white shadow-lg rounded-lg overflow-y-auto">
            <div className="flex-grow p-4 overflow-y-scroll scroll-auto space-y-4" ref={chatContainerRef}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                  message.user ? "justify-end" : "justify-start"
                }`}
                >
                  <div
                    className={`rounded-lg p-3 ${
                      message.user
                        ? "bg-[#2e1065] text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center p-4 border-t border-gray-300">
            <input
              type="text"
              className="flex-grow p-2 border rounded-lg focus:outline-none text-[#2e1065]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
            />
            <button
              onClick={handleSend}
              className="ml-4 px-4 py-2 bg-[#2e1065] text-white rounded-lg hover:bg-[#672ad8]"
            >
              Send
            </button>
          </div>
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
}
