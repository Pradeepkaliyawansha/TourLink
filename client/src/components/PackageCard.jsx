import { MapPin, Clock, Users, Star, MessageCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PackageCard = ({ pkg }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleChatClick = (e) => {
    e.stopPropagation();
    if (user) {
      navigate(`/chat/${pkg.guide._id}`);
    } else {
      navigate("/login");
    }
  };

  const handleViewDetails = () => {
    navigate(`/packages/${pkg._id}`);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700 cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {pkg.images && pkg.images.length > 0 ? (
          <>
            <img
              src={pkg.images[0]}
              alt={pkg.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.querySelector(
                  ".fallback-icon"
                ).style.display = "flex";
              }}
            />
            <div className="fallback-icon hidden items-center justify-center h-full">
              <MapPin className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <MapPin className="h-16 w-16 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {/* Image Count Badge */}
        {pkg.images && pkg.images.length > 1 && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{pkg.images.length} photos</span>
          </div>
        )}

        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
            ${pkg.price}
          </span>
        </div>

        <div className="absolute bottom-2 left-2 bg-primary-600 dark:bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          {pkg.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {pkg.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {pkg.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
            <span>{pkg.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
            <span>{pkg.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
            <span>Max {pkg.maxGroupSize} people</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Star className="h-4 w-4 mr-2 text-yellow-500 dark:text-yellow-400" />
            <span>
              {pkg.rating.toFixed(1)} ({pkg.reviews?.length || 0} reviews)
            </span>
          </div>
        </div>

        <div className="border-t dark:border-gray-700 pt-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium">Guide: {pkg.guide?.name}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
                className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition"
              >
                <Eye className="h-4 w-4" />
                <span>Details</span>
              </button>
              <button
                onClick={handleChatClick}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
