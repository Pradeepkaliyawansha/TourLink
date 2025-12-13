import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Users,
  Package,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Star,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Eye,
  Moon,
  Sun,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  MapPin,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Menu,
  X as CloseIcon,
  Home,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import { logout } from "../redux/authSlice";
import AdminSettings from "../components/AdminSettings";
import { useTheme } from "../context/ThemeContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();

  // State for API data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGuides: 0,
    totalPackages: 0,
    totalRevenue: 0,
    activeBookings: 0,
    avgRating: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    packageGrowth: 0,
    ratingChange: 0,
  });

  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  // Check if user is admin or guide
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Allow both admin and guide to access (as per original design)
    if (user.role !== "admin" && user.role !== "guide") {
      navigate("/");
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchUsers(), fetchPackages()]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch all packages to calculate stats
      const packagesRes = await axiosInstance.get("/packages");
      const allPackages = packagesRes.data.data;

      // Calculate category distribution
      const categories = {};
      allPackages.forEach((pkg) => {
        categories[pkg.category] = (categories[pkg.category] || 0) + 1;
      });

      // Calculate average rating
      const totalRating = allPackages.reduce((sum, pkg) => sum + pkg.rating, 0);
      const avgRating =
        allPackages.length > 0 ? totalRating / allPackages.length : 0;

      // Calculate total revenue (estimate from package prices * bookings)
      const totalRevenue = allPackages.reduce((sum, pkg) => {
        const bookings = pkg.reviews?.length || 0;
        return sum + pkg.price * bookings;
      }, 0);

      // Get active packages count
      const activePackages = allPackages.filter((pkg) => pkg.isActive).length;

      // Format category data for chart
      const categoryArray = Object.entries(categories).map(([name, count]) => ({
        name,
        value: Math.round((count / allPackages.length) * 100),
        color: getCategoryColor(name),
      }));

      setCategoryData(categoryArray);

      setStats((prev) => ({
        ...prev,
        totalPackages: allPackages.length,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalRevenue: Math.round(totalRevenue),
        activeBookings: activePackages,
        packageGrowth: 8.7,
        revenueGrowth: 18.3,
        ratingChange: 0.2,
      }));

      // Generate mock revenue data for the week
      const mockRevenueData = [45, 52, 48, 65, 58, 70, 62];
      setRevenueData(mockRevenueData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Try to get all users from admin endpoint
      const response = await axiosInstance.get("/auth/users");
      const allUsers = response.data.data;

      const formattedUsers = allUsers.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        joined: formatDate(u.createdAt),
        status: "active",
      }));

      setUsers(formattedUsers);

      // Count guides
      const guides = formattedUsers.filter((u) => u.role === "guide").length;

      setStats((prev) => ({
        ...prev,
        totalUsers: formattedUsers.length,
        totalGuides: guides,
        userGrowth: 12.5,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);

      // Fallback: Use conversation data
      try {
        const convRes = await axiosInstance.get("/chat/conversations");
        const conversations = convRes.data.data;

        const uniqueUsers = new Map();
        conversations.forEach((conv) => {
          if (conv.user && !uniqueUsers.has(conv.user._id)) {
            uniqueUsers.set(conv.user._id, {
              id: conv.user._id,
              name: conv.user.name,
              email: conv.user.email || "N/A",
              role: conv.user.role,
              joined: formatDate(conv.lastMessageTime),
              status: "active",
            });
          }
        });

        // Add current user
        uniqueUsers.set(user._id, {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          joined: "Current session",
          status: "active",
        });

        const usersArray = Array.from(uniqueUsers.values());
        setUsers(usersArray);

        const guides = usersArray.filter((u) => u.role === "guide").length;

        setStats((prev) => ({
          ...prev,
          totalUsers: usersArray.length,
          totalGuides: guides,
          userGrowth: 12.5,
        }));
      } catch (convError) {
        console.error("Error fetching conversations:", convError);
        // Last fallback: just show current user
        setUsers([
          {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            joined: "Current session",
            status: "active",
          },
        ]);
      }
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await axiosInstance.get("/packages");
      const packagesData = response.data.data;

      // Transform packages to match UI format
      const formattedPackages = packagesData.map((pkg) => ({
        id: pkg._id,
        title: pkg.title,
        guide: pkg.guide?.name || "Unknown",
        price: pkg.price,
        category: pkg.category,
        status: pkg.isActive ? "active" : "inactive",
        bookings: pkg.reviews?.length || 0,
        rating: pkg.rating,
      }));

      setPackages(formattedPackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Adventure: "bg-blue-500",
      Beach: "bg-cyan-500",
      Cultural: "bg-purple-500",
      Wildlife: "bg-green-500",
      City: "bg-orange-500",
      Mountain: "bg-indigo-500",
      Cruise: "bg-pink-500",
      Other: "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axiosInstance.delete(`/auth/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted successfully");
      fetchStats(); // Refresh stats
    } catch (error) {
      alert(
        "Error deleting user: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm("Are you sure you want to delete this package?"))
      return;

    try {
      await axiosInstance.delete(`/packages/${packageId}`);
      setPackages(packages.filter((p) => p.id !== packageId));
      alert("Package deleted successfully");
      fetchStats(); // Refresh stats
    } catch (error) {
      alert(
        "Error deleting package: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleTogglePackageStatus = async (packageId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await axiosInstance.put(`/packages/${packageId}`, {
        isActive: newStatus === "active",
      });

      setPackages(
        packages.map((p) =>
          p.id === packageId ? { ...p, status: newStatus } : p
        )
      );
      alert(
        `Package ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      alert(
        "Error updating package: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const exportData = (type) => {
    let data, filename;

    if (type === "users") {
      data = users;
      filename = "users_export.json";
    } else if (type === "packages") {
      data = packages;
      filename = "packages_export.json";
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ icon: Icon, title, value, change, trend, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <div
            className={`flex items-center space-x-1 text-sm font-medium ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            <span>{change}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.userGrowth}
          trend="up"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Package}
          title="Total Packages"
          value={stats.totalPackages}
          change={stats.packageGrowth}
          trend="up"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueGrowth}
          trend="up"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={Star}
          title="Average Rating"
          value={stats.avgRating}
          change={stats.ratingChange}
          trend="up"
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Revenue Overview
            </h3>
            <select className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm border-0 focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {revenueData.map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-600 hover:to-primary-500"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Package Categories
          </h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No category data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryData.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {category.value}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${category.color} rounded-full transition-all duration-500`}
                      style={{ width: `${category.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Recent Users
          </h3>
          <div className="space-y-3">
            {users.slice(0, 4).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Top Packages
          </h3>
          <div className="space-y-3">
            {packages.slice(0, 4).map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {pkg.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {pkg.bookings} bookings
                  </p>
                </div>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  ${pkg.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const UsersView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Users Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all users and guides
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportData("users")}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {u.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          u.role === "guide"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : u.role === "admin"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {u.joined}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/chat/${u.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                          title="Chat with user"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={u.id === user._id || u.role === "admin"}
                          title={
                            u.role === "admin"
                              ? "Cannot delete admin"
                              : "Delete user"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PackagesView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Packages Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all tour packages
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportData("packages")}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Guide
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {packages.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No packages found
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {pkg.title}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {pkg.guide}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {pkg.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ${pkg.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {pkg.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pkg.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/packages/${pkg.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleTogglePackageStatus(pkg.id, pkg.status)
                          }
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition"
                          title={
                            pkg.status === "active" ? "Deactivate" : "Activate"
                          }
                        >
                          {pkg.status === "active" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                          title="Delete package"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  TourHub
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-700 dark:text-gray-300"
            >
              {sidebarOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "users", icon: Users, label: "Users" },
            { id: "packages", icon: Package, label: "Packages" },
            { id: "analytics", icon: BarChart3, label: "Analytics" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? "bg-primary-600 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Home className="h-5 w-5" />
            {sidebarOpen && <span className="font-medium">Back to Site</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users, packages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 ml-4">
                <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "users" && <UsersView />}
          {activeTab === "packages" && <PackagesView />}
          {activeTab === "settings" && <AdminSettings />}
          {activeTab === "analytics" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Detailed analytics and reporting features coming soon
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
