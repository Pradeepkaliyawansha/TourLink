import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Calendar,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  User,
  Phone,
  Mail,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const BookingForm = () => {
  const { id: packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState(null);

  const [formData, setFormData] = useState({
    bookingDate: "",
    numberOfTravelers: 1,
    travelers: [{ name: "", age: "", gender: "Male", specialRequirements: "" }],
    specialRequests: "",
    emergencyContact: { name: "", phone: "", relation: "" },
    paymentMethod: "Credit Card",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPackage();
  }, [packageId, user, navigate]);

  const fetchPackage = async () => {
    try {
      const response = await axiosInstance.get(`/packages/${packageId}`);
      setPkg(response.data.data);
    } catch (error) {
      console.error("Error fetching package:", error);
      alert("Failed to load package details");
      navigate("/packages");
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (date, travelers) => {
    if (!date || !travelers) return;

    try {
      const response = await axiosInstance.get(
        `/bookings/availability/${packageId}?date=${date}&travelers=${travelers}`
      );
      setAvailability(response.data.data);
    } catch (error) {
      console.error("Error checking availability:", error);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setFormData({ ...formData, bookingDate: date });
    checkAvailability(date, formData.numberOfTravelers);
  };

  const handleTravelersChange = (count) => {
    const newCount = Math.max(1, Math.min(count, pkg?.maxGroupSize || 10));
    const travelers = Array(newCount)
      .fill()
      .map(
        (_, i) =>
          formData.travelers[i] || {
            name: "",
            age: "",
            gender: "Male",
            specialRequirements: "",
          }
      );

    setFormData({
      ...formData,
      numberOfTravelers: newCount,
      travelers,
    });
    checkAvailability(formData.bookingDate, newCount);
  };

  const handleTravelerChange = (index, field, value) => {
    const newTravelers = [...formData.travelers];
    newTravelers[index] = { ...newTravelers[index], [field]: value };
    setFormData({ ...formData, travelers: newTravelers });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bookingDate) {
      newErrors.bookingDate = "Please select a booking date";
    } else {
      const selectedDate = new Date(formData.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.bookingDate = "Booking date must be in the future";
      }
    }

    if (!formData.numberOfTravelers || formData.numberOfTravelers < 1) {
      newErrors.numberOfTravelers = "At least one traveler required";
    }

    formData.travelers.forEach((traveler, index) => {
      if (!traveler.name) {
        newErrors[`traveler_${index}_name`] = "Name is required";
      }
      if (!traveler.age || traveler.age < 0) {
        newErrors[`traveler_${index}_age`] = "Valid age is required";
      }
    });

    if (!formData.emergencyContact.name) {
      newErrors.emergencyName = "Emergency contact name required";
    }
    if (!formData.emergencyContact.phone) {
      newErrors.emergencyPhone = "Emergency contact phone required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    if (availability && !availability.available) {
      alert("Not enough spots available for selected date");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axiosInstance.post("/bookings", {
        packageId,
        ...formData,
      });

      alert("Booking request submitted successfully!");
      navigate(`/bookings/${response.data.data._id}`);
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(error.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = pkg ? pkg.price * formData.numberOfTravelers : 0;
  const minDate = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Book Your Tour
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date and Travelers */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Tour Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      Booking Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={minDate}
                      value={formData.bookingDate}
                      onChange={handleDateChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.bookingDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.bookingDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Users className="inline h-4 w-4 mr-2" />
                      Number of Travelers *
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleTravelersChange(formData.numberOfTravelers - 1)
                        }
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={pkg.maxGroupSize}
                        value={formData.numberOfTravelers}
                        onChange={(e) =>
                          handleTravelersChange(parseInt(e.target.value))
                        }
                        className="w-20 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-center"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleTravelersChange(formData.numberOfTravelers + 1)
                        }
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Max {pkg.maxGroupSize} travelers
                    </p>
                  </div>
                </div>

                {/* Availability Status */}
                {availability && formData.bookingDate && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      availability.available
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {availability.available ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <p
                        className={`text-sm font-medium ${
                          availability.available
                            ? "text-green-800 dark:text-green-300"
                            : "text-red-800 dark:text-red-300"
                        }`}
                      >
                        {availability.available
                          ? `${availability.availableSpots} spots available`
                          : "Not enough spots available for this date"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Traveler Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Traveler Information
                </h2>

                {formData.travelers.map((traveler, index) => (
                  <div
                    key={index}
                    className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Traveler {index + 1}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={traveler.name}
                          onChange={(e) =>
                            handleTravelerChange(index, "name", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={traveler.age}
                          onChange={(e) =>
                            handleTravelerChange(index, "age", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Gender
                        </label>
                        <select
                          value={traveler.gender}
                          onChange={(e) =>
                            handleTravelerChange(
                              index,
                              "gender",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Special Requirements
                        </label>
                        <input
                          type="text"
                          value={traveler.specialRequirements}
                          onChange={(e) =>
                            handleTravelerChange(
                              index,
                              "specialRequirements",
                              e.target.value
                            )
                          }
                          placeholder="Dietary, medical, etc."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Emergency Contact *
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContact.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            name: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.emergencyContact.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            phone: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relation
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact.relation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            relation: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., Spouse, Parent"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Special Requests
                </h2>
                <textarea
                  rows={4}
                  value={formData.specialRequests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialRequests: e.target.value,
                    })
                  }
                  placeholder="Any special requirements or requests..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  <CreditCard className="inline h-5 w-5 mr-2" />
                  Payment Method *
                </h2>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash (Pay on arrival)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  submitting || (availability && !availability.available)
                }
                className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? "Processing..." : "Confirm Booking"}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Booking Summary
              </h2>

              {pkg.images && pkg.images[0] && (
                <img
                  src={pkg.images[0]}
                  alt={pkg.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {pkg.title}
              </h3>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p>Duration: {pkg.duration}</p>
                <p>Location: {pkg.location}</p>
                <p>Difficulty: {pkg.difficulty}</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Price per person:</span>
                  <span className="font-semibold">${pkg.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of travelers:</span>
                  <span className="font-semibold">
                    {formData.numberOfTravelers}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total Amount:</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      ${totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Your booking will be confirmed by the guide within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
