import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, reset } from "../redux/authSlice";
import { LogIn, Shield, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Handle errors
    if (isError) {
      alert(message);
      dispatch(reset());
      return;
    }

    // Handle successful login - COMPLETELY FIXED
    if (isSuccess && user) {
      console.log("=== LOGIN SUCCESS ===");
      console.log("User object:", user);
      console.log("User role:", user.role);
      console.log("User ID:", user._id);

      // Determine target route
      const targetRoute = user.role === "admin" ? "/admin" : "/";
      console.log("Target route:", targetRoute);

      // Navigate immediately
      navigate(targetRoute, { replace: true });

      // Reset auth state after a delay to allow navigation to complete
      const timer = setTimeout(() => {
        console.log("Resetting auth state");
        dispatch(reset());
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    console.log("Logging in with isAdminLogin:", isAdminLogin);

    const userData = {
      email,
      password,
      isAdminLogin,
    };

    dispatch(login(userData));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        {/* Toggle between User and Admin Login */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setIsAdminLogin(false)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              !isAdminLogin
                ? "bg-primary-600 text-white dark:bg-primary-500"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            User Login
          </button>
          <button
            onClick={() => setIsAdminLogin(true)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              isAdminLogin
                ? "bg-primary-600 text-white dark:bg-primary-500"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Admin Login
          </button>
        </div>

        <div>
          <div className="flex justify-center">
            {isAdminLogin ? (
              <Shield className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            ) : (
              <LogIn className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isAdminLogin ? "Admin Sign In" : "Sign in to your account"}
          </h2>
          {!isAdminLogin && (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Or{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
              >
                create a new account
              </Link>
            </p>
          )}
        </div>

        {isAdminLogin && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              <Shield className="h-4 w-4 inline mr-2" />
              This is a restricted area for administrators only
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={onChange}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={onChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </span>
              ) : isAdminLogin ? (
                "Admin Sign In"
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
