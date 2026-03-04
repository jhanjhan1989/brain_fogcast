// src/App.tsx
import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import Sidebar from "./components/SideBar/Sidebar";
import Navbar from "./components/NavBar/NavBar";
import Register from "./pages/Register";

import { ThemeProvider } from "./ThemeContext";
import { Box, Clipboard, FileText, Users } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import PrivateRoute from "./components/PrivateRoute";
import NoAccess from "./components/NoAccess";
import PublicPage from "./pages/Dashboard/PublicPage";
import RiskCalculator from "./pages/Calculator/RiskCalculator";
import NavLinks from "./components/NavBar/NavLinks";
import MobileNavbar from "./components/NavBar/MobileNavBar";
import AboutPage from "./pages/PublicPages/AboutPage";
import FAQPage from "./pages/PublicPages/FAQPage";
import HeatMapPage from "./pages/PublicPages/HeatMapPage";
import ArticlesPage from "./pages/PublicPages/ArticlesPage";


export default function App() {
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // ----- Sidebar Links By Role -----
  const navLinksFull = [
    { label: "Dashboard", icon: <Box />, path: "/" },
    {
      label: "Tickets",
      icon: <FileText />,
      children: [
        { label: "All Tickets", path: "/tickets/all" },
        { label: "Create Ticket", path: "/tickets/create" },
      ],
    },
    {
      label: "Admin",
      icon: <Users />,
      children: [
        { label: "Ticket Status", path: "/admin/status" },
        { label: "Ticket Priorities", path: "/admin/priority" },
        { label: "Projects", path: "/admin/projects" },
        { label: "Users", path: "/admin/users" },
      ],
    },
  ];

  const navLinksLimited = [
    { label: "Dashboard", icon: <Box />, path: "/" },
    {
      label: "Tickets",
      icon: <FileText />,
      children: [{ label: "My Tickets", path: "/tickets/all" }],
    },
  ];

  const isFullAccess =
    user?.role === "ADMIN" ||
    user?.role === "PROJECT_MANAGER" ||
    user?.role === "QA";

  const sidebarLinks = isFullAccess ? navLinksFull : navLinksLimited;

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {
          user && (
            <Sidebar links={sidebarLinks} isOpen={isSidebarOpen} />
          )
        }


        <div
          className={user ? `flex-1 flex flex-col transition-all duration-300` : `flex-1 flex flex-col transition-all duration-300`}
          style={user ? { marginLeft: isSidebarOpen ? 256 : 64 } : {}}
        >
          {/* DESKTOP NAVBAR */}
          <div className="hidden md:block">
            <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
          </div>

          {/* MOBILE NAVBAR */}
          <div className="md:hidden">
            <MobileNavbar
              links={[
                { path: "/", label: "Home" },
                { path: "/risk-calculator", label: "Risk Calculator" },
                { path: "/heat-map", label: "Heat Map" },
                { path: "/articles", label: "Articles" },
                { path: "/about", label: "About Us" },
                { path: "/faq", label: "FAQ" },
                { path: "/contact", label: "Contact Us" },
              ]}
            />
          </div>


          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={user ? "flex-1 p-6 md:p-10 overflow-auto dark:bg-gray-900" : " w-full  overflow-auto"}
          >
            <Routes>
              <Route path="/" element={<PublicPage />} />
              <Route path="/risk-calculator" element={<RiskCalculator />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<AboutPage />}/>
              <Route path="/faq" element={<FAQPage />}/>
              <Route path="/heat-map" element={<HeatMapPage />}/>
              <Route path="/articles" element={<ArticlesPage />}/>

              {/* Catch-all route for unauthorized access */}
              <Route path="*" element={<NoAccess />} />
            </Routes>
          </motion.main>

          <footer className="bg-transparent text-right text-sm dark:bg-gray-900">
            © {new Date().getFullYear()} Brain Fogcast. All rights reserved.
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}
