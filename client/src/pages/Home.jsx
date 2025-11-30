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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl mb-8 text-primary-100 dark:text-primary-200">
              Connect with expert tour guides and explore amazing destinations
              worldwide
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/packages"
                className="bg-white text-primary-600 dark:bg-gray-100 dark:text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-white transition"
              >
                Browse Packages
              </Link>
              <Link
                to="/register"
                className="bg-primary-500 dark:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 dark:hover:bg-primary-500 transition border-2 border-white dark:border-gray-200"
              >
                Get Started
              </Link>
            </div>
          </div>
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
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              <feature.icon className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
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
      <div className="bg-gray-100 dark:bg-gray-800 py-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of travelers discovering amazing destinations
          </p>
          <Link
            to="/packages"
            className="inline-block bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Explore Packages Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
