import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin,
  Clock,
  Users,
  Star,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axiosInstance.get(`/packages/${id}`);
        setPkg(response.data.data);
      } catch (error) {
        console.error("Error fetching package:", error);
        alert("Failed to load package details");
        navigate("/packages");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id, navigate]);

  const handleChatClick = () => {
    if (user) {
      navigate(`/chat/${pkg.guide._id}`);
    } else {
      navigate("/login");
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === pkg.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? pkg.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Package not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Image Gallery Section */}
          <div className="relative">
            {pkg.images && pkg.images.length > 0 ? (
              <>
                <div className="relative h-96 bg-gray-200 dark:bg-gray-700">
                  <img
                    src={pkg.images[currentImageIndex]}
                    alt={`${pkg.title} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowGallery(true)}
                  />

                  {/* Image Navigation */}
                  {pkg.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition"
                      >
                        <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-white" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition"
                      >
                        <ChevronRight className="h-6 w-6 text-gray-800 dark:text-white" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {pkg.images.length}
                  </div>

                  {/* View All Photos Button */}
                  <button
                    onClick={() => setShowGallery(true)}
                    className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
                  >
                    View All Photos
                  </button>
                </div>

                {/* Thumbnail Strip */}
                {pkg.images.length > 1 && (
                  <div className="flex space-x-2 p-4 bg-gray-100 dark:bg-gray-900 overflow-x-auto">
                    {pkg.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-20 w-20 object-cover rounded cursor-pointer transition ${
                          idx === currentImageIndex
                            ? "ring-4 ring-primary-600 dark:ring-primary-400"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <MapPin className="h-24 w-24 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>

          {/* Package Details */}
          <div className="p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium">
                    {pkg.category}
                  </span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                    {pkg.difficulty}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {pkg.title}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    <span>{pkg.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">
                      {pkg.rating.toFixed(1)} ({pkg.reviews?.length || 0}{" "}
                      reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 text-right">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  ${pkg.price}
                </div>
                <button
                  onClick={handleChatClick}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Contact Guide</span>
                </button>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Duration
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {pkg.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Max Group Size
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {pkg.maxGroupSize} people
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Difficulty
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {pkg.difficulty}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About This Tour
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {pkg.description}
              </p>
            </div>

            {/* Included & Excluded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {pkg.included && pkg.included.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    {pkg.included.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pkg.excluded && pkg.excluded.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    What's Not Included
                  </h3>
                  <ul className="space-y-2">
                    {pkg.excluded.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Guide Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Your Guide
              </h3>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                  {pkg.guide?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">
                    {pkg.guide?.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {pkg.guide?.email}
                  </p>
                  {pkg.guide?.phone && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {pkg.guide.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 text-white hover:text-gray-300 transition"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>

          <div className="max-w-5xl max-h-[90vh] flex items-center justify-center">
            <img
              src={pkg.images[currentImageIndex]}
              alt={`${pkg.title} - ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-gray-300 transition"
          >
            <ChevronRight className="h-12 w-12" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg">
            {currentImageIndex + 1} / {pkg.images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetails;
