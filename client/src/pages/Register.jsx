import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { register, reset } from "../redux/authSlice";
import { UserPlus, Camera, CheckCircle } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    role: "tourist",
    phone: "",
    avatar: "",
  });

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Avatar options
  const avatarOptions = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/personas/svg?seed=Felix",
    "https://api.dicebear.com/7.x/personas/svg?seed=Aneka",
  ];

  useEffect(() => {
    if (isError) {
      alert(message);
    }

    if (isSuccess || user) {
      navigate("/");
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const { name, email, password, password2, role, phone, avatar } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvatarSelect = (avatarUrl) => {
    setFormData((prevState) => ({ ...prevState, avatar: avatarUrl }));
    setShowAvatarPicker(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      alert("Passwords do not match");
      return;
    }

    const userData = {
      name,
      email,
      password,
      role,
      phone,
      avatar: avatar || avatarOptions[0], // Default to first avatar if none selected
    };

    dispatch(register(userData));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <UserPlus className="h-12 w-12 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Avatar Selection */}
            <div className="flex flex-col items-center mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose Your Avatar
              </label>
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full border-4 border-primary-600 dark:border-primary-400 overflow-hidden cursor-pointer hover:opacity-80 transition"
                  onClick={() => setShowAvatarPicker(true)}
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Selected avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Click to choose an avatar
              </p>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your full name"
                value={name}
                onChange={onChange}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={onChange}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your phone number"
                value={phone}
                onChange={onChange}
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                I am a
              </label>
              <select
                id="role"
                name="role"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={role}
                onChange={onChange}
              >
                <option value="tourist">Tourist</option>
                <option value="guide">Tour Guide</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Admin accounts are created separately
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={onChange}
              />
            </div>

            <div>
              <label
                htmlFor="password2"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Confirm your password"
                value={password2}
                onChange={onChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[70vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Choose Your Avatar
                </h3>
              </div>

              <div className="p-4 overflow-y-auto max-h-[50vh]">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {avatarOptions.map((avatarUrl, index) => (
                    <button
                      key={index}
                      onClick={() => handleAvatarSelect(avatarUrl)}
                      className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        avatar === avatarUrl
                          ? "border-primary-600 ring-4 ring-primary-600/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary-400"
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`Avatar ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {avatar === avatarUrl && (
                        <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-primary-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
