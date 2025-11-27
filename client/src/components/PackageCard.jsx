import { MapPin, Clock, Users, Star, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PackageCard = ({ pkg }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleChatClick = () => {
    if (user) {
      navigate(`/chat/${pkg.guide._id}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 bg-gray-200">
        {pkg.images && pkg.images.length > 0 ? (
          <img
            src={pkg.images[0]}
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <MapPin className="h-16 w-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full shadow-md">
          <span className="text-sm font-bold text-primary-600">
            ${pkg.price}
          </span>
        </div>
        <div className="absolute top-2 left-2 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          {pkg.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {pkg.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-primary-600" />
            <span>{pkg.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-primary-600" />
            <span>{pkg.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-primary-600" />
            <span>Max {pkg.maxGroupSize} people</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            <span>
              {pkg.rating.toFixed(1)} ({pkg.reviews?.length || 0} reviews)
            </span>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Guide: {pkg.guide?.name}</p>
            </div>
            <button
              onClick={handleChatClick}
              className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
