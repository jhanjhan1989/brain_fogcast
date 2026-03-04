import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from "react";
import { setAuthToken, attach401Interceptor } from "../services/api"; // << add this

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => { },
  logout: () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    if (storedUser && storedToken&&userRole) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setRole(userRole);

    }
  }, []);

  useEffect(() => {
    if (token) setAuthToken(token);
    else setAuthToken(null);
  }, [token]);

  const login = useCallback((user: User, token: string) => {
    setUser(user);
    setToken(token);
    setToken(user.role);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", user.role);

  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setAuthToken(null); // clear axios header
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
