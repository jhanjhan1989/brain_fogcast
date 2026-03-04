import React from "react";
import Button from "../../components/UI/forms/Button";
import { Edit2, Trash2 } from "lucide-react";

interface Props {
    items: any;
    columns: string[]; // column keys
    onEdit: (item: any) => void;
    onDelete: (id: number) => void;
}

export default function TableRow({ items, columns, onEdit, onDelete }: Props) {
    return (
        <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            {columns.map((col) => (
                <td key={col} className="p-2 text-gray-700 dark:text-gray-300">
                    {renderCell(items[col], col)}
                </td>
            ))}

            <td className="p-2 flex gap-2 justify-end">
                <Button
                    variant="primary"
                    onClick={() => onEdit(items)}
                    title="Edit"
                >
                    <Edit2 size={16} />
                </Button>

                <Button
                    variant="danger"
                    onClick={() => onDelete(items.id)}
                    title="Delete"
                >
                    <Trash2 size={14} />
                </Button>
            </td>
        </tr>
    );
}

/**
 * Smart cell renderer:
 * - Color badges for roles
 * - Status badges (active/inactive)
 * - Boolean badges (Yes/No)
 * - Date formatting
 */
function renderCell(value: any, key: string) {
    if (value === null || value === undefined || value === "") {
        return <span className="italic text-gray-400">N/A</span>;
    }

    const val = String(value).trim();

    
    // --- COLOR CIRCLE ---
    if (key.toLowerCase() === "color") {
        return (
            <span
                className="inline-block w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: val }}
                title={val} // shows the color code on hover
            ></span>
        );
    }


    // --- STATUS BADGE ---
    if (key.toLowerCase() === "status") {
        const active = val.toLowerCase() === "active";
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${active
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
            >
                {active ? "Active" : "Inactive"}
            </span>
        );
    }

    // --- ROLE BADGE ---
    if (key.toLowerCase() === "role") {
        const colorMap: Record<string, string> = {
            ADMIN: "bg-red-500 text-white",
            PROJECT_MANAGER: "bg-blue-500 text-white",
            DEVELOPER: "bg-green-500 text-white",
            QA: "bg-yellow-500 text-gray-900",
            CLIENT: "bg-purple-500 text-white",
        };

        const color = colorMap[val.toUpperCase()] || "bg-gray-400 text-white";
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
                {val.replace("_", " ")}
            </span>
        );
    }

    // --- BOOLEAN BADGE ---
    if (typeof value === "boolean") {
        return value ? (
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100">
                Yes
            </span>
        ) : (
            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100">
                No
            </span>
        );
    }

    // --- DATE FORMATTING ---
    if (
        key.toLowerCase().includes("date") ||
        key.toLowerCase().includes("created") ||
        key.toLowerCase().includes("updated")
    ) {
        try {
            const date = new Date(value);
            return (
                <span title={date.toLocaleString()}>
                    {date.toLocaleDateString()}{" "}
                    <span className="text-xs text-gray-400">
                        {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </span>
            );
        } catch {
            return val;
        }
    }

    // --- DEFAULT TEXT ---
    return <span>{val}</span>;
}
