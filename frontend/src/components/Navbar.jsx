import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCarSide, FaUserCircle, FaBars, FaTimes, FaBell, FaMoon, FaSun } from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  let user = null;
  try {
    const userString = localStorage.getItem('user');
    if (userString && userString !== 'undefined') {
      user = JSON.parse(userString);
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm px-6 md:px-12 py-4 flex justify-between items-center h-20">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-slate-900 transition-transform active:scale-95 group">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100 group-hover:rotate-3 transition-transform">
          <FaCarSide size={24} />
        </div>
        <span className="tracking-tighter">RideNest</span>
      </Link>

      {/* Right: Desktop Menu */}
      <div className="hidden md:flex items-center gap-10">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">Home</Link>
          <Link to="/cars" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">Cars</Link>
          <Link to="/my-bookings" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">My Bookings</Link>
          {user && (
            <Link to="/host" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">Host Your Car</Link>
          )}
          {user && user.role === 'ADMIN' && (
            <Link to="/admin" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">Admin Dashboard</Link>
          )}
        </div>

        <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
          {user && <NotificationDropdown />}
          {user ? (
            <Link to="/profile" className="flex items-center gap-3 group">
              <div className="text-right hidden lg:block text-slate-800 font-bold text-sm">
                {user.name || user.email}
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500 p-0.5 group-hover:shadow-lg transition-all overflow-hidden bg-slate-50 flex items-center justify-center">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="User" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <FaUserCircle className="text-slate-300 w-full h-full" size={28} />
                )}
              </div>
            </Link>
          ) : null}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 rounded-full p-2 transition-colors hover:bg-slate-50"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'dark' ? (
              <FaSun className="w-4 h-4" />
            ) : (
              <FaMoon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
      >
        {mobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-20 bg-white z-[99] flex flex-col p-8 gap-6 animate-in slide-in-from-top duration-300 md:hidden overflow-y-auto h-screen">
          <div className="flex justify-between items-center py-3 border-b border-slate-50">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-slate-900">Home</Link>
            {user && <NotificationDropdown />}
          </div>
          <Link to="/cars" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-slate-900 py-3 border-b border-slate-50">Cars</Link>
          {user && (
            <>
              <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-slate-900 py-3 border-b border-slate-50">My Bookings</Link>
              <Link to="/host" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-slate-900 py-3 border-b border-slate-50">Host Your Car</Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-slate-900 py-3 border-b border-slate-50">Admin Dashboard</Link>
              )}
            </>
          )}
          <div className="mt-auto pb-32">
            {user ? (
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl">
                <div className="w-14 h-14 rounded-full border-2 border-indigo-500 p-0.5 overflow-hidden">
                   {user.profilePicture ? <img src={user.profilePicture} alt="User" /> : <FaUserCircle className="text-slate-300 w-full h-full" />}
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-lg">{user.name || user.email}</p>
                  <p className="text-indigo-600 text-sm font-bold">View Profile</p>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;