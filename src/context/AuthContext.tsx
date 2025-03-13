
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UserRole = "admin" | "user" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (username: string, password: string, rememberMe: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const navigate = useNavigate();

  // Check localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated");
    const savedRole = localStorage.getItem("userRole") as UserRole;
    
    if (savedAuth === "true" && savedRole) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
    }
  }, []);

  const login = (username: string, password: string, rememberMe: boolean) => {
    // This is a mock authentication - in a real app, you'd validate with a backend
    if (username && password) {
      // Mock logic to determine role based on username
      const role: UserRole = username.toLowerCase().includes("admin") ? "admin" : "user";
      
      setIsAuthenticated(true);
      setUserRole(role);
      
      // Store auth state if rememberMe is checked
      if (rememberMe) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", role);
      }
      
      // Redirect based on role
      navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
      
      toast.success(`Welcome, ${username}!`);
    } else {
      toast.error("Please provide both username and password");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    navigate("/");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
