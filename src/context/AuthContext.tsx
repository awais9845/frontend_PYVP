import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Notification, SystemStats } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  notifications: Notification[];
  stats: SystemStats | null;
  login: (email: string, passwordHash: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (formData: any) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchStats: () => Promise<void>;
  triggerToast: (title: string, message: string, type?: "success" | "error" | "info") => void;
  toast: { title: string; message: string; type: "success" | "error" | "info" } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: "success" | "error" | "info" } | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("pyvp_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("pyvp_user");
      }
    }
    setLoading(false);
    fetchStats();
  }, []);

  // Fetch stats and notifications when user state changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
    fetchStats();
  }, [user]);

  const triggerToast = (title: string, message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/public/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Error fetching public stats:", e);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/notifications/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  };

  const login = async (email: string, passwordHash: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordHash })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login credentials failed");
        triggerToast("Login Failed", data.error || "Please verify your credentials.", "error");
        return false;
      }

      setUser(data.user);
      localStorage.setItem("pyvp_user", JSON.stringify(data.user));
      triggerToast("Welcome Back", `Successfully logged in as ${data.user.fullName}.`, "success");
      return true;
    } catch (e: any) {
      setError(e.message || "Network error during login");
      triggerToast("Network Error", "Unable to reach the secure state authentication server.", "error");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem("pyvp_user");
    triggerToast("Logged Out", "You have successfully closed your secure state session.", "info");
  };

  const registerUser = async (formData: any): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration process failed");
        triggerToast("Submission Error", data.error || "Check your details and try again.", "error");
        return false;
      }

      triggerToast(
        "Application Received",
        "Your details were successfully saved. Please track your application status.",
        "success"
      );
      return true;
    } catch (e: any) {
      setError(e.message || "Network error during registration");
      triggerToast("Network Error", "Unable to transmit application packet to security database.", "error");
      return false;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...data })
      });

      const resData = await res.json();
      if (!res.ok) {
        triggerToast("Update Failed", resData.error || "Could not save changes.", "error");
        return false;
      }

      setUser(resData.user);
      localStorage.setItem("pyvp_user", JSON.stringify(resData.user));
      triggerToast("Profile Updated", "Your official personnel record has been successfully updated.", "success");
      return true;
    } catch (e: any) {
      triggerToast("Network Error", "Failed to reach registration record servers.", "error");
      return false;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const dbRes = await fetch("/api/admin/applications");
      if (dbRes.ok) {
        const applicants: User[] = await dbRes.json();
        const current = applicants.find(u => u.id === user.id);
        if (current) {
          setUser(current);
          localStorage.setItem("pyvp_user", JSON.stringify(current));
        }
      }
    } catch (e) {
      console.error("Error refreshing current member state:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        notifications,
        stats,
        login,
        logout,
        registerUser,
        updateProfile,
        refreshUser,
        fetchNotifications,
        fetchStats,
        triggerToast,
        toast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
