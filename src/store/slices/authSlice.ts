import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as authService from "../../services/authApi";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "applicant" | "member" | "executive" | "manager" | "admin" | "superAdmin" | "user";
  isVerified: boolean;
  profileImage?: { secure_url: string; public_id: string };
  application?: string;
  member?: string;
  createdAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// ── Initial State ─────────────────────────────────────────────────────────────
const storedUser = localStorage.getItem("pyvp_user");
const initialState: AuthState = {
  user:            storedUser ? JSON.parse(storedUser) : null,
  loading:         false,
  error:           null,
  isAuthenticated: !!storedUser,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: authService.LoginPayload, { rejectWithValue }) => {
    try {
      const data = await authService.loginUser(payload);
      const user = data.User || data.user;
      if (data.accessToken) {
        localStorage.setItem("pyvp_token", data.accessToken);
      }
      return user;
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) return rejectWithValue(serverMsg);
      if (err.message === "Network Error") {
        return rejectWithValue("We couldn't connect to the server. Please check your internet connection.");
      }
      return rejectWithValue("Invalid email or password.");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: authService.RegisterPayload, { rejectWithValue }) => {
    try {
      const data = await authService.registerUser(payload);
      const user = data.User || data.user;
      if (data.accessToken) {
        localStorage.setItem("pyvp_token", data.accessToken);
      }
      return user;
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) return rejectWithValue(serverMsg);
      if (err.message === "Network Error") {
        return rejectWithValue("We couldn't connect to the server. Please check your internet connection.");
      }
      return rejectWithValue("Unable to create account. Please check your credentials.");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logoutUser();
    } catch (err: any) {
      // Still clear local state even if logout API fails
      return rejectWithValue(null);
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (payload: authService.UpdateProfilePayload, { rejectWithValue }) => {
    try {
      const data = await authService.updateProfile(payload);
      return data.user || data.User;
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) return rejectWithValue(serverMsg);
      if (err.message === "Network Error") {
        return rejectWithValue("We couldn't connect to the server. Please check your internet connection.");
      }
      return rejectWithValue("Profile update failed.");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    // Manually hydrate user (e.g. from cookie-based session check)
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user            = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("pyvp_user", JSON.stringify(action.payload));
    },
    clearUser(state) {
      state.user            = null;
      state.isAuthenticated = false;
      state.error           = null;
      localStorage.removeItem("pyvp_user");
      localStorage.removeItem("pyvp_token");
    },
  },
  extraReducers: (builder) => {
    // ── Login ──
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload;
        state.isAuthenticated = true;
        if (action.payload) {
          localStorage.setItem("pyvp_user", JSON.stringify(action.payload));
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Register ──
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload;
        state.isAuthenticated = true;
        if (action.payload) {
          localStorage.setItem("pyvp_user", JSON.stringify(action.payload));
        }
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Logout ──
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user            = null;
        state.isAuthenticated = false;
        localStorage.removeItem("pyvp_user");
        localStorage.removeItem("pyvp_token");
      })
      .addCase(logoutThunk.rejected, (state) => {
        // Clear anyway
        state.user            = null;
        state.isAuthenticated = false;
        localStorage.removeItem("pyvp_user");
        localStorage.removeItem("pyvp_token");
      });

    // ── Update Profile ──
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
        localStorage.setItem("pyvp_user", JSON.stringify(action.payload));
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const { clearError, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
