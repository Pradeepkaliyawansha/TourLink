import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllPackages from "./pages/AllPackages";
import PackageDetails from "./pages/PackageDetails";
import MyPackages from "./pages/MyPackages";
import Chat from "./pages/Chat";
import ContactUs from "./pages/ContactUs";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Login Route - Redirect if already logged in */}
        <Route
          path="/login"
          element={
            user ? (
              user.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" replace />}
        />

        <Route path="/packages" element={<AllPackages />} />
        <Route path="/packages/:id" element={<PackageDetails />} />

        <Route
          path="/my-packages"
          element={
            user?.role === "guide" ? (
              <MyPackages />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/chat/:userId?"
          element={user ? <Chat /> : <Navigate to="/login" replace />}
        />

        <Route path="/contact" element={<ContactUs />} />

        {/* Admin Dashboard Route */}
        <Route
          path="/admin"
          element={
            user ? (
              user.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
