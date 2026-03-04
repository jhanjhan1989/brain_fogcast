import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, User, LogOut, Menu } from "lucide-react";
import { ThemeContext } from "../../ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import NavLinks from "./NavLinks";
import { useSidebar } from "../../context/SidebarToggleContext";

interface DesktopNavbarProps {
    links: { path: string; label: string }[];
}

const DesktopNavbar: React.FC<DesktopNavbarProps> = ({ links }) => {
    const { user, logout } = useAuth();
    const isAuthenticated = !!user;
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { toggleSidebar } = useSidebar();

    return (
        <header className="hidden md:flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-800 shadow-md z-50 fixed top-0 left-0 w-full">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <Menu size={22} />
                </button>
                <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    Brain Fogcast
                </h1>
                <nav className="hidden md:flex gap-4">
                    <NavLinks links={links} />
                </nav>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                    {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {isAuthenticated && (
                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            <User size={18} /> <span>{user?.fullName}</span>
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg overflow-hidden z-50">
                                <button
                                    onClick={() => { navigate("/profile"); setProfileOpen(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <User size={16} /> Edit Profile
                                </button>
                                <button
                                    onClick={() => { logout(); setProfileOpen(false); navigate("/home"); }}
                                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default DesktopNavbar;
