import React from "react";

interface BadgeProps {
    type: string;
    children: React.ReactNode;
}

const colors: Record<string, string> = {
    open: "bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100",
    "in-progress": "bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    high: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100",
    low: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
};

export default function Badge({ type, children }: BadgeProps) {
    const className = colors[type.toLowerCase()] || colors["low"];
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
}
