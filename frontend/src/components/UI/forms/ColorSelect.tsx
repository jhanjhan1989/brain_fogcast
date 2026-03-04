import { useState } from "react";

interface ColorSelectProps {
    items: { id: number; name: string; color: string }[];
    value?: number | string;
    onChange: (id: number | string) => void;
    placeholder?: string;
}

export function ColorSelect({ items, value, onChange, placeholder }: ColorSelectProps) {
    const [open, setOpen] = useState(false);
    const selected = items.find((i) => i.id === value);

    return (
        <div className="relative w-full">
            <button
                type="button"
                className="w-full border rounded p-2 flex justify-between items-center dark:bg-gray-700 dark:border-gray-600"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-2">
                    {selected && (
                        <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: selected.color }}
                        />
                    )}
                    <span>{selected?.name || placeholder || "Select..."}</span>
                </div>
                <span className="ml-2">&#9662;</span>
            </button>

            {open && (
                <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 mt-1 rounded shadow max-h-60 overflow-auto">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                                onChange(item.id);
                                setOpen(false);
                            }}
                        >
                            <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
