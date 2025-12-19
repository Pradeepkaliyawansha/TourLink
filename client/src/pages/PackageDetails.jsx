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
  Calendar,
  Shield,
  Award,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import Reviews from "../components/Reviews";

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [guideResponseRate, setGuideResponseRate] = useState(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axiosInstance.get(`/packages/${id}`);
        setPkg(response.data.data);

        // Fetch guide response rate
        if (response.data.data?.guide?._id) {
          fetchGuideResponseRate(response.data.data.guide._id);
        }
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

  const fetchGuideResponseRate = async (guideId) => {
    try {
      const response = await axiosInstance.get(
        `/reviews/guide/${guideId}/response-rate`
      );
      setGuideResponseRate(response.data.data);
    } catch (error) {
      console.error("Error fetching response rate:", error);
    }
  };

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
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading package details...
          </p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Package not found</p>
        <button
          onClick={() => navigate("/packages")}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Back to Packages
        </button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
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

                      {pkg.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition shadow-lg"
                          >
                            <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-white" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition shadow-lg"
                          >
                            <ChevronRight className="h-6 w-6 text-gray-800 dark:text-white" />
                          </button>
                        </>
                      )}

                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {pkg.images.length}
                      </div>

                      <button
                        onClick={() => setShowGallery(true)}
                        className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white shadow-lg"
                      >
                        View All Photos
                      </button>
                    </div>

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
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "included", label: "What's Included" },
                  { id: "reviews", label: "Reviews" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        About This Tour
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Location
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {pkg.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Duration
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {pkg.duration}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <Users className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Max Group Size
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {pkg.maxGroupSize} people
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Difficulty
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {pkg.difficulty}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Included Tab */}
                {activeTab === "included" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pkg.included && pkg.included.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          What's Included
                        </h3>
                        <ul className="space-y-3">
                          {pkg.included.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start space-x-3"
                            >
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
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          What's Not Included
                        </h3>
                        <ul className="space-y-3">
                          {pkg.excluded.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start space-x-3"
                            >
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
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <Reviews
                    packageId={pkg._id}
                    guideId={pkg.guide?._id}
                    currentUser={user}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Price per person
                  </p>
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    ${pkg.price}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {pkg.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                  {pkg.category}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ml-2">
                  {pkg.difficulty}
                </span>
              </div>

              <button
                onClick={handleChatClick}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Contact Guide</span>
              </button>
              <button
                onClick={() => navigate(`/packages/${pkg._id}/book`)}
                className="w-full mt-4 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white  dark:bg-primary-500 dark:hover:bg-primary-600 px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-xl"
              >
                Book This Tour
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                {user
                  ? "Chat with the guide to book this tour"
                  : "Login to contact the guide"}
              </p>
            </div>

            {/* Guide Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                Your Guide
              </h3>

              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {pkg.guide?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">
                    {pkg.guide?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Professional Guide
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                  <span>{pkg.guide?.email}</span>
                </div>
                {pkg.guide?.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MessageCircle className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                    <span>{pkg.guide.phone}</span>
                  </div>
                )}
              </div>

              {guideResponseRate && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Response Rate
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {guideResponseRate.responseRate}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Based on {guideResponseRate.totalReviews} reviews
                  </p>
                </div>
              )}
            </div>

            {/* Trust & Safety */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-primary-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Award className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                Trust & Safety
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Verified guide profiles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Secure messaging platform</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>24/7 customer support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Money-back guarantee</span>
                </li>
              </ul>
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
