import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  ChevronLeft,
  Download,
  Edit2,
  Save,
  X,
  Package,
  CreditCard,
  Shield,
  FileText,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [guideNotes, setGuideNotes] = useState("");

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}`);
      setBooking(response.data.data);
      setGuideNotes(response.data.data.guideNotes || "");
    } catch (error) {
      console.error("Error fetching booking:", error);
      alert("Failed to load booking details");
      navigate("/my-bookings");
    } finally {
      setLoading(false);
    }
  };

  const isGuide = user && booking && booking.guide._id === user._id;
  const isTourist = user && booking && booking.tourist._id === user._id;

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      alert("Please select a status");
      return;
    }

    setActionLoading(true);
    try {
      await axiosInstance.put(`/bookings/${id}/status`, {
        status: selectedStatus,
        note: statusNote,
      });
      alert("Booking status updated successfully");
      setShowStatusModal(false);
      fetchBooking();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    setActionLoading(true);
    try {
      await axiosInstance.put(`/bookings/${id}/cancel`, {
        reason: cancelReason,
      });
      alert("Booking cancelled successfully");
      setShowCancelModal(false);
      fetchBooking();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/bookings/${id}/notes`, {
        notes: guideNotes,
      });
      alert("Notes saved successfully");
      setShowNotesModal(false);
      fetchBooking();
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes");
    } finally {
      setActionLoading(false);
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

    const icons = {
      Pending: AlertCircle,
      Confirmed: CheckCircle,
      Completed: CheckCircle,
      Cancelled: XCircle,
    };

    const Icon = icons[status];

    return (
      <span
        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${styles[status]}`}
      >
        <Icon className="h-4 w-4" />
        <span>{status}</span>
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
        className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Booking not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Booking Code:{" "}
                <span className="font-mono font-semibold">
                  {booking.bookingCode}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(booking.status)}
              {getPaymentBadge(booking.paymentStatus)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Package Information
                </h2>
              </div>

              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  {booking.package.images && booking.package.images[0] && (
                    <img
                      src={booking.package.images[0]}
                      alt={booking.package.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {booking.package.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        {booking.package.location}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        {booking.package.duration}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/packages/${booking.package._id}`)}
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
                >
                  View Package Details →
                </button>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Booking Information
                </h2>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tour Date
                  </label>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {formatDate(booking.bookingDate)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Number of Travelers
                  </label>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    <Users className="inline h-4 w-4 mr-1" />
                    {booking.numberOfTravelers}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Total Amount
                  </label>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ${booking.totalAmount}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Payment Method
                  </label>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    <CreditCard className="inline h-4 w-4 mr-1" />
                    {booking.paymentMethod}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Booked On
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(booking.createdAt)} at{" "}
                    {formatTime(booking.createdAt)}
                  </p>
                </div>

                {booking.daysUntilBooking !== undefined &&
                  booking.status !== "Cancelled" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Days Until Tour
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {booking.daysUntilBooking > 0 ? (
                          <span className="text-blue-600 dark:text-blue-400">
                            {booking.daysUntilBooking} days
                          </span>
                        ) : booking.daysUntilBooking === 0 ? (
                          <span className="text-green-600 dark:text-green-400">
                            Today!
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            Past
                          </span>
                        )}
                      </p>
                    </div>
                  )}
              </div>

              {booking.specialRequests && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Special Requests
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {booking.specialRequests}
                  </p>
                </div>
              )}
            </div>

            {/* Traveler Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Travelers
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {booking.travelers.map((traveler, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Traveler {index + 1}
                      </h4>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {traveler.gender}, {traveler.age} years old
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Name:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white font-medium">
                          {traveler.name}
                        </span>
                      </div>
                      {traveler.specialRequirements && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">
                            Special Requirements:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {traveler.specialRequirements}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            {booking.emergencyContact && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Emergency Contact
                  </h2>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {booking.emergencyContact.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {booking.emergencyContact.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Relation
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {booking.emergencyContact.relation || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Guide Notes (Visible to guide only) */}
            {isGuide && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Guide Notes
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="p-6">
                  {booking.guideNotes ? (
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">
                      {booking.guideNotes}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No notes added yet
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cancellation Info */}
            {booking.status === "Cancelled" && booking.cancellation && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-red-900 dark:text-red-300 mb-2">
                      Booking Cancelled
                    </h3>
                    <div className="space-y-2 text-sm text-red-800 dark:text-red-300">
                      <p>
                        <strong>Cancelled On:</strong>{" "}
                        {formatDate(booking.cancellation.cancelledAt)} at{" "}
                        {formatTime(booking.cancellation.cancelledAt)}
                      </p>
                      <p>
                        <strong>Reason:</strong>{" "}
                        {booking.cancellation.cancellationReason}
                      </p>
                      {booking.cancellation.refundAmount > 0 && (
                        <p>
                          <strong>Refund Amount:</strong> $
                          {booking.cancellation.refundAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isTourist ? "Your Guide" : "Tourist"}
                </h3>
              </div>

              <div className="p-6">
                {isTourist ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                        {booking.guide.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {booking.guide.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Tour Guide
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2" />
                        {booking.guide.email}
                      </div>
                      {booking.guide.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4 mr-2" />
                          {booking.guide.phone}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/chat/${booking.guide._id}`)}
                      className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Message Guide</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {booking.tourist.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {booking.tourist.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Tourist
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2" />
                        {booking.tourist.email}
                      </div>
                      {booking.tourist.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4 mr-2" />
                          {booking.tourist.phone}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/chat/${booking.tourist._id}`)}
                      className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Message Tourist</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            {(isTourist || isGuide) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Actions
                  </h3>
                </div>

                <div className="p-6 space-y-3">
                  {isGuide &&
                    booking.status !== "Cancelled" &&
                    booking.status !== "Completed" && (
                      <button
                        onClick={() => setShowStatusModal(true)}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        <Edit2 className="h-5 w-5" />
                        <span>Update Status</span>
                      </button>
                    )}

                  {isTourist && booking.canCancel && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                      <X className="h-5 w-5" />
                      <span>Cancel Booking</span>
                    </button>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    <Download className="h-5 w-5" />
                    <span>Print Details</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Update Booking Status
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Status *
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">Select status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm
                                font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Note (optional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Add a note for this status update"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{actionLoading ? "Updating..." : "Update Status"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Cancel Booking
              </h3>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Please explain why you are cancelling"
              />
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                Close
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>
                  {actionLoading ? "Cancelling..." : "Confirm Cancel"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Guide Notes
              </h3>
            </div>

            <div className="p-6">
              <textarea
                value={guideNotes}
                onChange={(e) => setGuideNotes(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Add private notes for this booking"
              />
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{actionLoading ? "Saving..." : "Save Notes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
