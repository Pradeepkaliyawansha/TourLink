import { Link } from "react-router-dom";
import { MapPin, Users, Shield, MessageCircle } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: MapPin,
      title: "Explore Destinations",
      description:
        "Discover amazing tour packages from professional guides around the world.",
    },
    {
      icon: Users,
      title: "Expert Guides",
      description:
        "Connect with experienced tour guides who know their destinations inside out.",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description:
        "Communicate directly with guides to plan your perfect trip.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Book with confidence through our secure platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section - Enhanced for Dark Mode */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-gray-800 dark:via-gray-900 dark:to-black text-white overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full border border-white/20 dark:border-white/10">
              <MapPin className="h-4 w-4 mr-2 text-primary-200 dark:text-primary-400" />
              <span className="text-sm font-medium text-white/90 dark:text-gray-200">
                Explore 500+ Destinations Worldwide
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="block text-white">Discover Your Next</span>
              <span className="block bg-gradient-to-r from-primary-200 to-white dark:from-primary-400 dark:to-gray-100 bg-clip-text text-transparent">
                Adventure
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl mb-10 text-primary-100 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Connect with expert tour guides and explore amazing destinations
              worldwide. Your perfect journey starts here.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:space-x-4">
              <Link
                to="/packages"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 dark:bg-primary-500 dark:text-white rounded-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <span className="relative z-10">Browse Packages</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-white dark:from-primary-600 dark:to-primary-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-transparent text-white rounded-lg font-semibold border-2 border-white/30 dark:border-primary-400/30 backdrop-blur-sm hover:bg-white/10 dark:hover:bg-white/5 hover:border-white/50 dark:hover:border-primary-400/50 transition-all duration-200"
              >
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-white/10">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-primary-100 dark:text-gray-400">
                  Destinations
                </div>
              </div>
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-white/10">
                <div className="text-3xl font-bold text-white mb-1">1000+</div>
                <div className="text-sm text-primary-100 dark:text-gray-400">
                  Tour Guides
                </div>
              </div>
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-white/10">
                <div className="text-3xl font-bold text-white mb-1">50K+</div>
                <div className="text-sm text-primary-100 dark:text-gray-400">
                  Happy Travelers
                </div>
              </div>
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-white/10">
                <div className="text-3xl font-bold text-white mb-1">4.9★</div>
                <div className="text-sm text-primary-100 dark:text-gray-400">
                  Average Rating
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-12 sm:h-20 fill-gray-50 dark:fill-gray-900"
          >
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose TourHub?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your gateway to unforgettable travel experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 py-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 border border-gray-200 dark:border-gray-700">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers discovering amazing destinations. Your
              next adventure awaits!
            </p>
            <Link
              to="/packages"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Explore Packages Now
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
