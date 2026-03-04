import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "warning" | "add" | "save" | "cancel";
    loading?: boolean;
}

export default function Button({ variant = "primary", loading, children, className, ...props }: ButtonProps) {
    const base = "px-4 py-2 rounded-md font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: " hover:bg-transparent hover:text-emerald-500",
        secondary: " hover:bg-transparent hover:text-gray-300",
        danger: " hover:bg-transparent hover:text-red-500",
        warning: " hover:bg-transparent hover:text-yellow-600",
        add: " bg-emerald-600 hover:bg-emerald-700 text-white",
        save: " bg-emerald-600 hover:bg-emerald-700 text-white",
        cancel: " bg-red-600 hover:bg-red-700 text-white",
    };


    return (
        <button className={clsx(base, variants[variant], className)} {...props} disabled={loading || props.disabled}>
            {loading ? "Loading..." : children}
        </button>
    );
}
