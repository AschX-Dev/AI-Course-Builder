export default function Home() {
  const target = "/create-course";
  return (
    <div className="min-h-screen bg-white">
      <header className="max-w-6xl mx-auto flex items-center justify-between p-6">
        <div className="text-xl font-bold text-purple-700">AlphaWave</div>
        <a href={target} className="bg-purple-600 text-white px-4 py-2 rounded">
          Get Started
        </a>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="text-4xl sm:text-6xl font-extrabold">
          AI Course <span className="text-purple-600">Builder</span>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Revolutionize your course creation with our AI-powered app, delivering
          engaging and high-quality courses in seconds.
        </p>
        <div>
          <a
            href={target}
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded shadow"
          >
            Get started
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-10">
          <div className="p-4 border rounded">
            <div className="font-medium">25+ templates</div>
            <div className="text-sm text-gray-600">
              Responsive, mobile-first
            </div>
          </div>
          <div className="p-4 border rounded">
            <div className="font-medium">Customisable</div>
            <div className="text-sm text-gray-600">
              Components easily extended
            </div>
          </div>
          <div className="p-4 border rounded">
            <div className="font-medium">Free to Use</div>
            <div className="text-sm text-gray-600">Well documented</div>
          </div>
          <div className="p-4 border rounded">
            <div className="font-medium">24/7 Support</div>
            <div className="text-sm text-gray-600">We’ve got you covered</div>
          </div>
        </div>
      </main>
    </div>
  );
}
