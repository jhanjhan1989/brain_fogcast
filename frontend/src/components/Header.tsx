import React from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export default function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
    return (
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 shadow-md">
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    Brain Fogcast
                </h1>
            </div>
        </header>
    );
}
