import Link from "next/link";
import Image from "next/image";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function AboutUs() {
  // Team member details with added social links
  const teamMembers = [
    {
      name: "Joel Payippara Shibu",
      role: "Software Engineer",
      image: "/team/joel.jpg",
      description: "",
      linkedin: "",
      github: "",
    },
    {
      name: "Hassan Amin",
      role: "Software Engineer",
      image: "/team/hassan.jpg",
      description: "",
      linkedin: "",
      github: "",
    },
    {
      name: "Saif Ahmad",
      role: "Software Engineer",
      image: "/team/saif.jpg",
      description: "",
      linkedin: "",
      github: "",
    },
    {
      name: "Yoosuf Bakhtair",
      role: "Software Engineer",
      image: "/team/yoosuf.jpg",
      description: "",
      linkedin: "",
      github: "",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-bl from-black via-[#150050] to-[#3f0071] text-white">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
          About Us
        </h1>
        <p className="mt-2 text-md text-gray-300">
          Learn more about the team behind WE.AI.
        </p>
        <Link href="/landing">
          <button className="mt-4 px-4 py-2 bg-[#3e00713a] rounded-lg shadow-[0_0_5px_#a855f7] hover:shadow-[0_0_15px_#a855f7] transition duration-300">
            Back to Home
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6">
        {/* Team Section */}
        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
            Our Team
          </h2>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={150}
                  height={150}
                  className="rounded-full mx-auto shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_15px_#a855f7]"
                  priority
                />

                <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
                <p className="text-gray-300">{member.role}</p>
                {/* Social Icons */}
                <div className="flex justify-center space-x-2 mt-2">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin
                      className="text-blue-500 hover:text-blue-600"
                      size={20}
                    />
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGithub
                      className="text-gray-300 hover:text-gray-400"
                      size={20}
                    />
                  </a>
                </div>
                <p className="mt-2 text-gray-400">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Project Section */}
        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
            Our Project
          </h2>
          <p className="mt-4 text-lg text-gray-300 text-center">
            WE.AI is an AI-powered assistant designed to help engineering
            students at Western University. Our goal is to streamline the
            learning experience by providing quick and accurate information
            related to engineering courses, projects, and university resources.
          </p>
          <p className="mt-4 text-lg text-gray-300 text-center">
            We believe that by leveraging the power of AI, we can make learning
            more efficient and enjoyable. Our team has worked tirelessly to
            develop a tool that not only answers your questions but also learns
            from your interactions to provide more personalized assistance over
            time.
          </p>
          <p className="mt-4 text-lg text-gray-300 text-center">
            We hope that you find WE.AI helpful and that it enhances your
            experience as an engineering student at Western University.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 w-full p-4">
        <p>
          Built by Western Software Engineering Students | &copy;{" "}
          {new Date().getFullYear()} WE.AI
        </p>
      </footer>
    </div>
  );
}
