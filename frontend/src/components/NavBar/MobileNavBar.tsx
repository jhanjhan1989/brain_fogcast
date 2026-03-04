import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react";
import { ThemeContext } from "../../ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import NavLinks from "./NavLinks";

interface MobileNavbarProps {
    links: { path: string; label: string }[];
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ links }) => {
    const { user, logout } = useAuth();
    const isAuthenticated = !!user;
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <>
            {/* MOBILE TOP BAR */}
            <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 shadow-md">
                <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    Brain Fogcast
                </h1>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="text-gray-600 dark:text-gray-300"
                >
                    <Menu size={22} />
                </button>
            </header>

            {/* BACKDROP */}
            <div
                className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${mobileOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                    }`}
            ></div>

            {/* SIDEBAR PANEL */}
            <div
                className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        Brain Fogcast
                    </h1>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="text-gray-600 dark:text-gray-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* NAVIGATION LINKS */}
                <nav className="flex flex-col p-4 gap-3">
                    {/* Auto-injected nav links */}
                    <NavLinks
                        links={links}
                        onClick={() => setMobileOpen(false)}
                    />

                    {/* THEME SWITCH */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                        <span className="font-medium">{theme === "light" ? 'Light' : 'Dark'}</span>
                    </button>

                    {isAuthenticated && (
                        <>
                            {/* PROFILE */}
                            <button
                                onClick={() => {
                                    navigate("/profile");
                                    setMobileOpen(false);
                                }}
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <User size={18} /> Edit Profile
                            </button>

                            {/* LOGOUT */}
                            <button
                                onClick={() => {
                                    logout();
                                    setMobileOpen(false);
                                    navigate("/home");
                                }}
                                className="flex items-center gap-3 px-3 py-2 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-gray-700 transition"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </>
    );
};

export default MobileNavbar;
