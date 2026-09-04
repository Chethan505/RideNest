import './styles/main.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cars from './pages/Cars';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Host from './pages/Host';
import AdminSignup from './pages/AdminSignup';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import LicenseVerification from "./pages/LicenseVerification";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* Full width pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Container pages */}
        <Route
          path="*"
          element={
            <div className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cars" element={<Cars />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/host" element={<Host />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/license-verification"
                  element={<LicenseVerification />}
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-setup" element={<AdminSignup />} />
              </Routes>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
