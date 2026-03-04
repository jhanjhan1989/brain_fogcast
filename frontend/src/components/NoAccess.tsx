// src/pages/NoAccess.tsx
import React from "react";

export default function NoAccess() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700 dark:text-gray-300">
                You do not have permission to view this page.
            </p>
        </div>
    );
}
