import React from "react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, path = "#", icon, collapsed = false }) => {
  return (
    <NavLink
      to={path}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition
        hover:bg-gray-100 dark:hover:bg-gray-700
        ${collapsed ? "justify-center" : "justify-start"}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
    </NavLink>
  );
};

export default SidebarItem;
