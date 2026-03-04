import React from "react";
import { NavLink } from "react-router-dom";

interface SidebarLinkProps {
    path: string;
    label: string;
    onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ path, label, onClick }) => (
    <NavLink
        to={path}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${isActive
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white shadow"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
        }
    >
        {label}
    </NavLink>
);

export default SidebarLink;
