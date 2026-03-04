import React from "react";

interface SelectProps {
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
    placeholder?: string;
    className?: string;
    error?: string;
}

export default function SelectInput({
    label,
    value,
    onChange,
    options,
    placeholder,
    className = "",
    error,
}: SelectProps) {
    return (
        <div className="flex flex-col w-full">
            {label && <label className="mb-1 text-gray-700 dark:text-gray-300 font-medium">{label}</label>}

            <select
                value={value}
                onChange={onChange}
                className={`w-full border border-emerald-500 rounded-md p-2 dark:bg-gray-700 dark:text-gray-100 ${className}`}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt.replace("_", " ")}
                    </option>
                ))}
            </select>

            {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
        </div>
    );
}
