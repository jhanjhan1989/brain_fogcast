import React from "react";
import TableRow from "./TableRow";

interface Props {
  items: any[];
  onEdit: (project: any) => void;
  onDelete: (id: number) => void;
  columns?: string[]; // Optional: allows manual control of columns
}

export default function Table({
  items,
  onEdit,
  onDelete,
  columns,
}: Props) {
  // Auto-generate column headers from the first object if not provided
  const headers =
    columns && columns.length > 0
      ? columns
      : items.length > 0
        ? Object.keys(items[0]).filter(
          (key) => key !== "id" && key !== "password" // optional: exclude certain fields
        )
        : [];

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize"
              >
                {header.replace(/_/g, " ")}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.isArray(items) && items.length > 0 ? (
            items.map((item) => (
              <TableRow
                key={item.id}
                items={item}
                onEdit={onEdit}
                onDelete={onDelete}
                columns={headers} // optional if TableRow uses it
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length + 1}
                className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
              >
                No projects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
