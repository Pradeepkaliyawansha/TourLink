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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Connect with expert tour guides and explore amazing destinations
              worldwide
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/packages"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Browse Packages
              </Link>
              <Link
                to="/register"
                className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 transition border-2 border-white"
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose TourHub?
          </h2>
          <p className="text-xl text-gray-600">
            Your gateway to unforgettable travel experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of travelers discovering amazing destinations
          </p>
          <Link
            to="/packages"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Explore Packages Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
