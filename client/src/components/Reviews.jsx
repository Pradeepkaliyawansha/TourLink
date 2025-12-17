import { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Camera,
  X,
  Shield,
  Send,
  Edit2,
  Trash2,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const Reviews = ({ packageId, guideId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [error, setError] = useState(null);

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
    photos: [],
  });

  // Check if current user is the guide
  const isGuide = currentUser && currentUser._id === guideId;

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [packageId, filter, sort]);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParam = filter !== "all" ? `&rating=${filter}` : "";
      const response = await axiosInstance.get(
        `/reviews/${packageId}?sort=${sort}${filterParam}`
      );
      console.log("Reviews loaded:", response.data);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setError("Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axiosInstance.get(`/reviews/${packageId}/stats`);
      console.log("Stats loaded:", response.data);
      setStats(response.data.data);
    } catch (error) {
      console.error("Error loading stats:", error);
      setStats(null);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.photos.length > 5) {
      alert("Maximum 5 photos allowed");
      return;
    }
    setFormData({ ...formData, photos: [...formData.photos, ...files] });
  };

  const removePhoto = (index) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please login to submit a review");
      return;
    }

    if (!formData.title || !formData.comment) {
      alert("Please fill in all required fields");
      return;
    }

    const data = new FormData();
    data.append("packageId", packageId);
    data.append("rating", formData.rating);
    data.append("title", formData.title);
    data.append("comment", formData.comment);
    formData.photos.forEach((photo) => {
      data.append("photos", photo);
    });

    try {
      const response = await axiosInstance.post("/reviews", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Review submitted:", response.data);

      setShowReviewForm(false);
      setFormData({ rating: 5, title: "", comment: "", photos: [] });

      // Reload reviews and stats
      await loadReviews();
      await loadStats();

      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!currentUser) {
      alert("Please login to vote");
      return;
    }

    try {
      const response = await axiosInstance.post(`/reviews/${reviewId}/vote`, {
        voteType,
      });

      // Update the review in the list
      setReviews(
        reviews.map((review) => {
          if (review._id === reviewId) {
            return {
              ...review,
              helpfulCount: response.data.data.helpfulCount,
              unhelpfulCount: response.data.data.unhelpfulCount,
            };
          }
          return review;
        })
      );
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to submit vote");
    }
  };

  const handleStartReply = (reviewId) => {
    setReplyingTo(reviewId);
    setReplyMessage("");
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyMessage("");
  };

  const handleSubmitReply = async (reviewId) => {
    if (!replyMessage.trim()) {
      alert("Please enter a reply message");
      return;
    }

    setReplyLoading(true);
    try {
      const response = await axiosInstance.post(`/reviews/${reviewId}/reply`, {
        message: replyMessage.trim(),
      });

      console.log("Reply submitted:", response.data);

      // Update the review with the new reply
      setReviews(
        reviews.map((review) => {
          if (review._id === reviewId) {
            return {
              ...review,
              guideReply: response.data.data,
            };
          }
          return review;
        })
      );

      setReplyingTo(null);
      setReplyMessage("");
      alert("Reply posted successfully!");
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert(error.response?.data?.message || "Failed to post reply");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your reply?")) {
      return;
    }

    try {
      // You'll need to add this endpoint to your backend
      await axiosInstance.delete(`/reviews/${reviewId}/reply`);

      // Update the review to remove the reply
      setReviews(
        reviews.map((review) => {
          if (review._id === reviewId) {
            const { guideReply, ...rest } = review;
            console.log(guideReply);
            return rest;
          }
          return review;
        })
      );

      alert("Reply deleted successfully!");
    } catch (error) {
      console.error("Error deleting reply:", error);
      alert(error.response?.data?.message || "Failed to delete reply");
    }
  };

  const StarRating = ({ rating, onChange, readonly = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange && onChange(star)}
            className={`${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } transition`}
            disabled={readonly}
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.averageRating}
              </div>
              <StarRating
                rating={Math.round(Number(stats.averageRating))}
                readonly
              />
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Based on {stats.totalReviews} reviews
              </p>
            </div>

            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-3">
                  <button
                    onClick={() => setFilter(rating)}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 w-16"
                  >
                    {rating} stars
                  </button>
                  <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-500"
                      style={{
                        width: `${stats.ratingDistribution[rating] || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                    {stats.ratingDistribution[rating] || 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        {currentUser && !isGuide && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg font-medium transition"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Write Your Review
          </h3>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating *
              </label>
              <StarRating
                rating={formData.rating}
                onChange={(rating) => setFormData({ ...formData, rating })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                maxLength={100}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Summarize your experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Review *
              </label>
              <textarea
                maxLength={1000}
                rows={5}
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Share your experience with this tour..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.comment.length}/1000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Photos (Max 5)
              </label>
              <div className="space-y-2">
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <div className="flex flex-col items-center">
                    <Camera className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Add Photos
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={formData.photos.length >= 5}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg font-medium transition"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              No reviews yet. Be the first to review!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-bold">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {review.user.name}
                      </h4>
                      {review.isVerifiedBooking && (
                        <span className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          <Shield className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <StarRating rating={review.rating} readonly />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {review.title}
                </h5>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {review.comment}
                </p>
              </div>

              {review.photos && review.photos.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {review.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                    />
                  ))}
                </div>
              )}

              {/* Guide Reply */}
              {review.guideReply && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        Guide's Response
                      </span>
                    </div>
                    {isGuide && (
                      <button
                        onClick={() => handleDeleteReply(review._id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete reply"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {review.guideReply.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(review.guideReply.repliedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Reply Form (for guides) */}
              {isGuide && !review.guideReply && replyingTo === review._id && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    placeholder="Write your response..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={handleCancelReply}
                      disabled={replyLoading}
                      className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitReply(review._id)}
                      disabled={replyLoading}
                      className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{replyLoading ? "Posting..." : "Post Reply"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Reply Button (for guides who haven't replied) */}
              {isGuide && !review.guideReply && replyingTo !== review._id && (
                <button
                  onClick={() => handleStartReply(review._id)}
                  className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Reply to this review</span>
                </button>
              )}

              {/* Vote Buttons */}
              <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleVote(review._id, "helpful")}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition"
                  disabled={!currentUser}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">{review.helpfulCount || 0}</span>
                </button>
                <button
                  onClick={() => handleVote(review._id, "unhelpful")}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                  disabled={!currentUser}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-sm">{review.unhelpfulCount || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
