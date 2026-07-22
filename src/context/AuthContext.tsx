import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import {
  loginThunk,
  logoutThunk,
  registerThunk,
  updateProfileThunk,
  setUser,
  AuthUser,
} from "../store/slices/authSlice";
import { SystemStats, Notification } from "../types";
import { getPublicStats } from "../services/memberApi";
import { submitApplication } from "../services/applicationApi";
import * as authService from "../services/authApi";

// ── Context Shape ─────────────────────────────────────────────────────────────
interface AuthContextType {
  user:               AuthUser | null;
  loading:            boolean;
  error:              string | null;
  notifications:      Notification[];
  stats:              SystemStats | null;
  login:              (email: string, password: string) => Promise<boolean>;
  logout:             () => void;
  registerUser:       (formData: any) => Promise<boolean>;
  updateProfile:      (data: Partial<AuthUser>) => Promise<boolean>;
  refreshUser:        () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchStats:         () => Promise<void>;
  triggerToast:       (title: string, message: string, type?: "success" | "error" | "info") => void;
  toast:              { title: string; message: string; type: "success" | "error" | "info" } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats]                 = useState<SystemStats | null>(null);
  const [toast, setToast]                 = useState<{
    title: string; message: string; type: "success" | "error" | "info";
  } | null>(null);

  // ── Toast ───────────────────────────────────────────────────────────────────
  const triggerToast = useCallback(
    (title: string, message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ title, message, type });
      setTimeout(() => setToast(null), 5000);
    },
    []
  );

  // ── Public Stats ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const data = await getPublicStats();
      if (data.success) setStats(data);
    } catch {
      // Non-critical, silently fail
    }
  }, []);

  // ── Notifications (placeholder — backend doesn't have a notification route yet) ──
  const fetchNotifications = useCallback(async () => {
    // When a dedicated notifications API exists, call it here.
    // For now we use an empty array so nothing breaks.
    setNotifications([]);
  }, []);

  // ── Boot: fetch public stats once ────────────────────────────────────────────
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await dispatch(loginThunk({ email, password }));
      if (loginThunk.fulfilled.match(result)) {
        const u = result.payload as AuthUser;
        triggerToast("Welcome Back", `You are now signed in as ${u?.fullName}.`, "success");
        return true;
      } else {
        triggerToast("Login Failed", (result.payload as string) || "Invalid credentials.", "error");
        return false;
      }
    } catch {
      triggerToast("Connection Error", "We couldn't connect to the server. Please check your internet connection.", "error");
      return false;
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = () => {
    dispatch(logoutThunk());
    setNotifications([]);
    triggerToast("Logged Out", "You have been securely logged out.", "info");
  };

  // ── Register (creates a User account AND submits their membership application) ──
  const registerUser = async (formData: any): Promise<boolean> => {
    try {
      const result = await dispatch(
        registerThunk({
          fullName:    formData.fullName,
          email:       formData.email,
          phoneNumber: formData.phoneNumber || formData.phone || "",
          password:    formData.password,
          cnic:        formData.cnic,
          phone:       formData.phoneNumber || formData.phone || "",
          province:    formData.province,
          constituency: formData.constituency,
          gender:      formData.gender,
          dob:         formData.dob,
          education:   formData.education,
          bio:         formData.bio,
          paymentReceipt: formData.paymentReceipt,
          documentUrl:  formData.documentUrl,
          profilePic:   formData.profilePic
        })
      );
      if (registerThunk.fulfilled.match(result)) {
        const newUser = result.payload as AuthUser;

        // Auto-submit the application record associated with the new user ID
        const appPayload = {
          user:          newUser._id,
          fullName:      formData.fullName,
          email:         formData.email,
          cnic:          formData.cnic,
          education:     formData.education,
          address:       `${formData.constituency || ""}, ${formData.province || ""}`,
          receipt: {
            secure_url: formData.paymentReceipt || "",
            public_id:  ""
          },
          cnicFront: formData.documentUrl ? {
            secure_url: formData.documentUrl,
            public_id:  ""
          } : undefined,
          profileImage: formData.profilePic ? {
            secure_url: formData.profilePic,
            public_id:  ""
          } : undefined
        };

        try {
          await submitApplication(appPayload);
          triggerToast(
            "Application Submitted",
            "Your account has been created and your application is now under review.",
            "success"
          );
          return true;
        } catch (appErr: any) {
          const appErrMsg = appErr?.response?.data?.message || appErr.message || "Failed to submit your application.";
          triggerToast("Registration Failed", `User account created, but application failed: ${appErrMsg}`, "error");
          return false;
        }
      } else {
        const errorMsg = (result.payload as string) || (result as any).error?.message || "Could not create account.";
        triggerToast("Registration Failed", errorMsg, "error");
        return false;
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Unable to submit your application.";
      triggerToast("Registration Failed", msg, "error");
      return false;
    }
  };

  // ── Update Profile ────────────────────────────────────────────────────────────
  const updateProfile = async (data: Partial<AuthUser>): Promise<boolean> => {
    try {
      const result = await dispatch(updateProfileThunk(data as any));
      if (updateProfileThunk.fulfilled.match(result)) {
        triggerToast(
          "Profile Updated Successfully",
          "Your information has been saved successfully.",
          "success"
        );
        return true;
      } else {
        const errMsg = (result.payload as string) || "We couldn't update your profile at this time. Please try again later.";
        triggerToast("Unable to Update Profile", errMsg, "error");
        return false;
      }
    } catch {
      triggerToast(
        "Unable to Update Profile",
        "We couldn't update your profile at this time. Please try again later.",
        "error"
      );
      return false;
    }
  };

  // ── Refresh User ─────────────────────────────────────────────────────────────
  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      if (data.success && data.user) {
        dispatch(setUser(data.user));
      }
    } catch {
      // Silently fail if not logged in or network error
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
        toast,
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
