
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UserRole = "admin" | "user" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("userRole") as UserRole;
    
    if (token && savedRole) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
    }
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setIsAuthenticated(true);
      setUserRole(data.user.role);
      
      // Store auth state if rememberMe is checked or always for simplicity
      if (rememberMe || true) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);
      }
      
      // Redirect based on role
      navigate(data.user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
      
      toast.success(`Welcome, ${username}!`);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
