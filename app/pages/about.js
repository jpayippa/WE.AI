import Link from "next/link";
import Image from "next/image";

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-bl from-[#000000] via-[#150050] to-[#3f0071] text-white">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
          About Us
        </h1>
        <p className="mt-2 text-lg text-gray-300">Learn more about the team behind WE.AI</p>
        <Link href="/landing" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6">
        {/* Team Section */}
        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-3xl font-bold text-center">Our Team</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Joel Payippara Shibu", role: "Lead Software Engineer", image: "/team-member-1.jpg" },
              { name: "Hassan Amin", role: "AI Specialist", image: "/team-member-2.jpg" },
              { name: "Saif Ahmad", role: "Frontend Developer", image: "/team-member-3.jpg" },
              { name: "Yoosuf Bakhtair", role: "Machine Learning Engineer", image: "/team-member-4.jpg" }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={150}
                  height={150}
                  className="rounded-full mx-auto"
                />
                <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
                <p className="text-gray-300">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Project Section */}
        <section className="max-w-4xl mx-auto mt-12 text-center">
          <h2 className="text-3xl font-bold">Our Project</h2>
          <p className="mt-4 text-lg text-gray-300">
            WE.AI is an AI-powered assistant designed to help engineering students at Western University. 
            Our goal is to streamline the learning experience by providing quick and accurate information 
            related to engineering courses, projects, and university resources.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 w-full p-4">
        <p>
          Built by Western Software Engineering Students | &copy; {new Date().getFullYear()} WE.AI
        </p>
        <Link href="/landing" className="text-purple-400 hover:text-purple-300">
          Back to Home
        </Link>
      </footer>
    </div>
  );
}
