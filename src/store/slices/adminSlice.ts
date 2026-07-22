import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as adminService from "../../services/adminApi";

interface AdminState {
  dashboard: any | null;
  statistics: any | null;
  users: any[];
  applications: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  dashboard:    null,
  statistics:   null,
  users:        [],
  applications: [],
  loading:      false,
  error:        null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────
export const fetchDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getDashboard();
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load dashboard.");
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  "admin/fetchStatistics",
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getStatistics();
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load statistics.");
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getAllUsers();
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load users.");
    }
  }
);

export const fetchAdminApplications = createAsyncThunk(
  "admin/fetchApplications",
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getAdminApplications();
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load applications.");
    }
  }
);

export const approveApplicationThunk = createAsyncThunk(
  "admin/approveApplication",
  async (id: string, { rejectWithValue }) => {
    try {
      return await adminService.approveApplication(id);
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Approval failed.");
    }
  }
);

export const rejectApplicationThunk = createAsyncThunk(
  "admin/rejectApplication",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      return await adminService.rejectApplication(id, reason);
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Rejection failed.");
    }
  }
);

export const assignRoleThunk = createAsyncThunk(
  "admin/assignRole",
  async ({ id, role, portfolio }: { id: string; role: string; portfolio?: string }, { rejectWithValue }) => {
    try {
      return await adminService.assignRole(id, role, portfolio);
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Role assignment failed.");
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  "admin/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminService.deleteUser(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Delete failed.");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending   = (state: AdminState) => { state.loading = true;  state.error = null; };
    const rejected  = (state: AdminState, action: any) => { state.loading = false; state.error = action.payload as string; };

    builder
      .addCase(fetchDashboard.pending,   pending)
      .addCase(fetchDashboard.fulfilled, (state, a) => { state.loading = false; state.dashboard = a.payload.dashboard; })
      .addCase(fetchDashboard.rejected,  rejected);

    builder
      .addCase(fetchStatistics.pending,   pending)
      .addCase(fetchStatistics.fulfilled, (state, a) => { state.loading = false; state.statistics = a.payload.statistics; })
      .addCase(fetchStatistics.rejected,  rejected);

    builder
      .addCase(fetchAdminUsers.pending,   pending)
      .addCase(fetchAdminUsers.fulfilled, (state, a) => { state.loading = false; state.users = a.payload.users || []; })
      .addCase(fetchAdminUsers.rejected,  rejected);

    builder
      .addCase(fetchAdminApplications.pending,   pending)
      .addCase(fetchAdminApplications.fulfilled, (state, a) => { state.loading = false; state.applications = a.payload.applications || []; })
      .addCase(fetchAdminApplications.rejected,  rejected);

    builder
      .addCase(approveApplicationThunk.fulfilled, (state, a) => {
        const updated = a.payload.application;
        if (updated) {
          state.applications = state.applications.map((app) =>
            app._id === updated._id ? updated : app
          );
        }
      });

    builder
      .addCase(rejectApplicationThunk.fulfilled, (state, a) => {
        const updated = a.payload.application;
        if (updated) {
          state.applications = state.applications.map((app) =>
            app._id === updated._id ? updated : app
          );
        }
      });

    builder
      .addCase(deleteUserThunk.fulfilled, (state, a) => {
        state.users = state.users.filter((u) => u._id !== a.payload);
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
