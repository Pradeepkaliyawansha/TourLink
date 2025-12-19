import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const response = await axiosInstance.get(
        `/bookings/my-bookings${params}`
      );
      setBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    try {
      await axiosInstance.put(`/bookings/${bookingId}/cancel`, { reason });
      alert("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Confirmed:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Completed:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const styles = {
      Pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your tour bookings
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            {["all", "Pending", "Confirmed", "Completed", "Cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    filter === status
                      ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {status === "all" ? "All Bookings" : status}
                </button>
              )
            )}
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't made any bookings yet. Explore our packages!
            </p>
            <button
              onClick={() => navigate("/packages")}
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Browse Packages
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Package Image */}
                  <div className="md:w-1/4">
                    {booking.package.images && booking.package.images[0] ? (
                      <img
                        src={booking.package.images[0]}
                        alt={booking.package.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 md:h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {booking.package.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Booking Code:{" "}
                          <span className="font-mono font-semibold">
                            {booking.bookingCode}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(booking.status)}
                        {getPaymentBadge(booking.paymentStatus)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        <div>
                          <p className="text-xs">Tour Date</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        <div>
                          <p className="text-xs">Travelers</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {booking.numberOfTravelers}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        <div>
                          <p className="text-xs">Location</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {booking.package.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        <div>
                          <p className="text-xs">Total Amount</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${booking.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Days Until Booking */}
                    {booking.status !== "Cancelled" &&
                      booking.status !== "Completed" && (
                        <div className="mb-4">
                          {booking.daysUntilBooking > 0 ? (
                            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>
                                {booking.daysUntilBooking} days until your tour
                              </span>
                            </div>
                          ) : booking.daysUntilBooking === 0 ? (
                            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              <span>Your tour is today!</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Tour date has passed</span>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Cancellation Info */}
                    {booking.status === "Cancelled" && booking.cancellation && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-300">
                          <AlertCircle className="inline h-4 w-4 mr-2" />
                          Cancelled on{" "}
                          {formatDate(booking.cancellation.cancelledAt)}
                        </p>
                        {booking.cancellation.refundAmount > 0 && (
                          <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                            Refund Amount: $
                            {booking.cancellation.refundAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/bookings/${booking._id}`)}
                        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>

                      {booking.canCancel && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel Booking</span>
                        </button>
                      )}

                      {booking.status === "Completed" &&
                        !booking.reviewSubmitted && (
                          <button
                            onClick={() =>
                              navigate(`/packages/${booking.package._id}`)
                            }
                            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Write Review</span>
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
