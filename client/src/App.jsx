import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllPackages from "./pages/AllPackages";
import MyPackages from "./pages/MyPackages";
import Chat from "./pages/Chat";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />
        <Route path="/packages" element={<AllPackages />} />
        <Route
          path="/my-packages"
          element={
            user?.role === "guide" ? <MyPackages /> : <Navigate to="/" />
          }
        />
        <Route
          path="/chat/:userId?"
          element={user ? <Chat /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
