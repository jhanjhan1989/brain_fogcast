import React, { useContext, useState, useRef, useEffect } from "react";
import { Sun, Moon, Menu, User, LogOut, ChevronDown, Calculator } from "lucide-react";
import { ThemeContext } from "../../ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Avatar from "../../assets/avatar.jpg";
import Login from "../../pages/Login";
import { AnimatePresence, motion } from "framer-motion";
import LogoLight from "../../assets/brand_logo_light.png";

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [dropdownRight, setDropdownRight] = useState(false);

  useEffect(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownRight(rect.right + 320 > window.innerWidth);
  }, [loginOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
        setLoginOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">

      {/* LEFT: LOGO + HAMBURGER */}
      <div className="flex items-center gap-4">
        {user && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Menu size={24} />
          </button>
        )}

        <a href="/">
          <img src={LogoLight} alt="Hero Illustration" className="w-full max-w-xs" />
        </a>
      </div>

      {/* CENTER: NAV LINKS (NOT BUTTONS) */}
      
      <nav className="hidden md:flex items-center gap-6">

        <button
          onClick={() => navigate("/")}
          className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium"
        >
           

          Home
        </button>

        <button
          onClick={() => navigate("/risk-calculator")}
          className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium"
        >
          Risk Calculator
        </button>

        <button
          onClick={() => navigate("/heat-map")}
          className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium"
        >
          Heat Map
        </button>

        <button
          onClick={() => navigate("/articles")}
          className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium"
        >
          Articles
        </button>

        <button
          onClick={() => navigate("/about")}
          className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium"
        >
          About Us
        </button>

        <button
          onClick={() => navigate("/faq")}
          className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium"
        >
          FAQ
        </button>

        <button
          onClick={() => navigate("/contact")}
          className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium"
        >
          Contact Us
        </button>

      </nav>


      {/* RIGHT: THEME + AUTH */}
      <div className="flex items-center gap-4 relative" ref={profileRef}>
        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* AUTH SECTION */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <img
                src={Avatar}
                alt="User Avatar"
                className="h-6 w-6 rounded-full border border-gray-300 dark:border-gray-600"
              />
              <span className="hidden md:inline font-medium">{user.fullName}</span>
              <ChevronDown size={16} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-sm"
                  onClick={() => navigate("/profile")}
                >
                  <User size={16} /> Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm text-red-500"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex items-center gap-3" ref={buttonRef}>
            {/* LOGIN */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLoginOpen(!loginOpen)}
              className="flex items-center justify-center px-5 py-2 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-lg transition-all"
            >
              Login
              <ChevronDown size={16} className={`ml-2 transition-transform ${loginOpen ? "rotate-180" : ""}`} />
            </motion.button>

            {/* REGISTER */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="px-5 py-2 rounded-full bg-transparent border-2 border-purple-600 text-purple-600 font-medium hover:bg-purple-50 dark:hover:bg-purple-600/20 hover:text-purple-700 dark:hover:text-purple-300 shadow-md transition-all"
            >
              Register
            </motion.button>

            {/* LOGIN DROPDOWN */}
            <AnimatePresence>
              {loginOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 5 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute top-full mt-3 w-80 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-3xl shadow-xl z-50 ${dropdownRight ? "right-0" : "left-0"
                    }`}
                >
                  <Login />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
