import Image from "next/image";
import Link from "next/link";
import MotionWrapperDelay from "./components/FramerMotion/MotionWrapperDelay";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col gradient-background2">
      <header className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
            AI Card Creator
          </h1>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 py-8 sm:py-12 md:py-16 text-center">
          <div className="animate-fade-in">
            <MotionWrapperDelay
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              variants={{
                hidden: { opacity: 0, x: 100 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <h2 className="text-xl gradient-title sm:text-2xl md:text-5xl font-semibold mb-4">
                Create Personalized AI-Generated Greeting Cards
              </h2>
            </MotionWrapperDelay>

            <div className="flex justify-center items-center mb-6">
              <MotionWrapperDelay
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Image
                  src="/image.jpg"
                  alt="AI Generated Card Preview"
                  width={600}
                  height={400}
                  className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[600px] h-auto rounded-lg shadow-2xl border-4 border-purple-200"
                />
              </MotionWrapperDelay>
            </div>
            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              Tell us about the special person in your life, and our AI will
              create a unique card with custom artwork and personalized poetry.
              Upload your own photos or let our AI generate beautiful imagery
              with heartfelt messages tailored just for them.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 max-w-4xl mx-auto">
              <MotionWrapperDelay
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                variants={{
                  hidden: { opacity: 0, x: 100 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-purple-300/30">
                  <div className="text-2xl sm:text-3xl mb-3">🎨</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                    AI Image Generation
                  </h3>
                  <p className="text-sm text-gray-300">
                    Custom artwork created based on your person's interests and
                    personality
                  </p>
                </div>
              </MotionWrapperDelay>

              <MotionWrapperDelay
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-purple-300/30">
                  <div className="text-2xl sm:text-3xl mb-3">✍️</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                    Personalized Poetry
                  </h3>
                  <p className="text-sm text-gray-300">
                    Heartfelt poems and messages crafted specifically for your
                    recipient
                  </p>
                </div>
              </MotionWrapperDelay>

              <MotionWrapperDelay
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                variants={{
                  hidden: { opacity: 0, x: -100 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-purple-300/30">
                  <div className="text-2xl sm:text-3xl mb-3">📸</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                    Your Photos Welcome
                  </h3>
                  <p className="text-sm text-gray-300">
                    Upload your own images to incorporate into the card design
                  </p>
                </div>
              </MotionWrapperDelay>
            </div>
            <Link href="/editor">
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Create Your AI Card
              </button>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 mt-4">
              No design skills needed • Generated in minutes • Perfect for any
              occasion
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 AI Card Creator. Spreading joy through personalized art.</p>
        </div>
      </footer>
    </div>
  );
}
