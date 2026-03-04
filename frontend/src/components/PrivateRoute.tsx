import React from "react";
import { Navigate } from "react-router-dom";
import NoAccess from "./NoAccess";
 
interface PrivateRouteProps {
    allowedRoles: string[];
    userRole?: string | null;
    children: React.ReactNode;
}

export default function PrivateRoute({ allowedRoles, userRole, children }: PrivateRouteProps) {
    // Fallback to localStorage if userRole is undefined (e.g., on page refresh)
    const role = userRole || localStorage.getItem("userRole");

    console.log("Current role:", role);

    if (!role) {
        // Not logged in
        return <Navigate to="/" />;
    }

    if (!allowedRoles.includes(role)) {
        // Logged in but no permission
        return <NoAccess />;
    }

    // User is authorized
    return <>{children}</>;
}
