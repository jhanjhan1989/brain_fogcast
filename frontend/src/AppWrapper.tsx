// src/AppWrapper.tsx
import React from "react";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { SidebarProvider } from "./context/SidebarToggleContext";

export default function AppWrapper() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </AuthProvider>
  );
}
