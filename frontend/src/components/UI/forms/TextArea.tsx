import React from "react";

interface TextareaProps {
    label?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    error?: string;
    disabled?: boolean;
}

export default function Textarea({
    label,
    name,
    value,
    onChange,
    placeholder,
    rows = 4,
    error,
    disabled = false,
}: TextareaProps) {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label
                    htmlFor={name}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                </label>
            )}

            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={`w-full px-3 py-2 rounded-lg border text-sm resize-none
                    outline-none
                    transition-all
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                    ${error
                        ? "border-red-500 focus:ring-2 focus:ring-red-400"
                        : "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300"
                    }
                    disabled:opacity-60 disabled:cursor-not-allowed
                `}
            />

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
