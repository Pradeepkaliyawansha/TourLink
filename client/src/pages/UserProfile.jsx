import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  X,
  Shield,
  Calendar,
  Edit2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import { setUser } from "../redux/authSlice";

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });

  // Avatar options
  const avatarOptions = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Bella",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Charlie",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Bella",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Charlie",
    "https://api.dicebear.com/7.x/personas/svg?seed=Felix",
    "https://api.dicebear.com/7.x/personas/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/personas/svg?seed=Bella",
    "https://api.dicebear.com/7.x/personas/svg?seed=Charlie",
  ];

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      avatar: user?.avatar || avatarOptions[0],
    });
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (avatarUrl) => {
    setFormData({ ...formData, avatar: avatarUrl });
    setShowAvatarPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axiosInstance.put("/auth/profile", formData);
      console.log(response);
      // Update local storage and Redux
      const updatedUser = { ...user, ...formData, token: user.token };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch(setUser(updatedUser));

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);

      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "guide":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 animate-fadeIn ${
              message.type === "success"
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800"></div>

          <div className="px-6 pb-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 overflow-hidden shadow-xl">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-600 text-white text-4xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute bottom-2 right-2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transform transition hover:scale-110"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 sm:mt-0 flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="mt-4 sm:mt-0 flex space-x-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user?.name || "",
                            phone: user?.phone || "",
                            avatar: user?.avatar || "",
                          });
                        }}
                        className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>{loading ? "Saving..." : "Save"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              {/* Account Details Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Account Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {user?.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {user?.email}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {user?.phone || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Role
                    </label>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(
                          user?.role
                        )}`}
                      >
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  {/* Member Since */}
                  {user?.createdAt && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Member Since
                      </label>
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Choose Your Avatar
                </h3>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => handleAvatarSelect(avatar)}
                      className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        formData.avatar === avatar
                          ? "border-primary-600 ring-4 ring-primary-600/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary-400"
                      }`}
                    >
                      <img
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {formData.avatar === avatar && (
                        <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-primary-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
