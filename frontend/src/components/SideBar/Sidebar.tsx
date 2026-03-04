import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Sun,
    Moon,
    LogOut,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { ThemeContext } from "../../ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../../assets/logo.png";
import LogoSmall from "../../assets/logo_small.png";

interface MenuLink {
    label: string;
    icon?: React.ReactNode;
    path?: string;
    children?: MenuLink[];
}

interface SidebarProps {
    links: MenuLink[];
    isOpen: boolean;
}

interface SidebarItemProps extends MenuLink {
    collapsed: boolean;
    activePath: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    label,
    icon,
    path,
    children,
    collapsed,
    activePath,
}) => {
    const [open, setOpen] = useState(false);

    // Determine if this link is currently active
    const isActive = path && activePath.startsWith(path);

    if (path) {
        // Regular link
        return (
            <Link
                to={path}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition
          ${isActive
                        ? "bg-emerald-100 dark:bg-emerald-700 text-gray-700 dark:text-white font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}  
            >
                {icon}  
                {!collapsed && <span>{label}</span>}
            </Link>
        );
    }

    // Expandable group (no path)
    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition
          ${children ? "justify-between" : "justify-start"}
          hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300`}
            >
                <div className="flex items-center gap-2">
                    {icon}
                    {!collapsed && <span>{label}</span>}
                </div>
                {children && !collapsed && (
                    <span className="ml-auto">
                        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                )}
            </button>

            {children && open && !collapsed && (
                <div className="ml-6 flex flex-col mt-1 space-y-1">
                    {children.map((child) => (
                        <SidebarItem
                            key={child.label}
                            {...child}
                            collapsed={collapsed}
                            activePath={activePath}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Sidebar({ links, isOpen }: SidebarProps) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const location = useLocation();

    return (
        <aside
            className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        flex flex-col transition-all duration-300 z-50 shadow-lg
        ${isOpen ? "w-64" : "w-16"}`}
        >
            {/* Header / Logo */}
            <div
                className={`flex items-center px-4 py-4 font-bold text-indigo-600 dark:text-indigo-400 transition-all duration-300
          ${isOpen ? "justify-start gap-2" : "justify-center"}`}
            >
                <img
                    src={isOpen ? Logo : LogoSmall}
                    alt="GeoRiskPH Logo"
                    className="h-8 w-auto transition-all duration-300"
                />
            </div>

            {/* Menu */}
            <nav className="flex-1 flex flex-col px-1 mt-2 space-y-1 overflow-auto">
                {links.map((link) => (
                    <div key={link.label}>
                        {/* Group Label */}
                        {!link.children && !link.path && isOpen && (
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {link.label}
                            </div>
                        )}
                        <SidebarItem {...link} collapsed={!isOpen} activePath={location.pathname} />
                    </div>
                ))}
            </nav>
        </aside>
    );
}
