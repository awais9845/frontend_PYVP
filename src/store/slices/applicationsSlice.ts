import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as applicationService from "../../services/applicationApi";

interface ApplicationsState {
  myApplication: any | null;
  applications:  any[];
  loading:       boolean;
  error:         string | null;
  submitted:     boolean;
}

const initialState: ApplicationsState = {
  myApplication: null,
  applications:  [],
  loading:       false,
  error:         null,
  submitted:     false,
};

export const submitApplicationThunk = createAsyncThunk(
  "applications/submit",
  async (payload: applicationService.ApplicationPayload, { rejectWithValue }) => {
    try {
      const data = await applicationService.submitApplication(payload);
      return data.application;
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Application submission failed."
      );
    }
  }
);

export const fetchMyApplication = createAsyncThunk(
  "applications/fetchMine",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await applicationService.getApplication(id);
      return data.application;
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to fetch application."
      );
    }
  }
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearApplicationsError(state) { state.error = null; },
    resetSubmitted(state) { state.submitted = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitApplicationThunk.pending,   (s) => { s.loading = true;  s.error = null; s.submitted = false; })
      .addCase(submitApplicationThunk.fulfilled, (s, a) => { s.loading = false; s.myApplication = a.payload; s.submitted = true; })
      .addCase(submitApplicationThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder
      .addCase(fetchMyApplication.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchMyApplication.fulfilled, (s, a) => { s.loading = false; s.myApplication = a.payload; })
      .addCase(fetchMyApplication.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
  },
});

export const { clearApplicationsError, resetSubmitted } = applicationsSlice.actions;
export default applicationsSlice.reducer;
