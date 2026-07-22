import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as memberService from "../../services/memberApi";

interface MembersState {
  members: any[];
  loading: boolean;
  error:   string | null;
}

const initialState: MembersState = { members: [], loading: false, error: null };

export const fetchMembers = createAsyncThunk(
  "members/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await memberService.getAllMembers();
      return data.members || [];
    } catch (e: any) {
      if (e.name === "CanceledError" || e.code === "ERR_CANCELED") {
        return rejectWithValue("Canceled");
      }
      return rejectWithValue(e.response?.data?.message || "Failed to load members.");
    }
  }
);

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearMembersError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchMembers.fulfilled, (s, a) => { 
        s.loading = false; 
        s.members = a.payload; 
        s.error = null; 
      })
      .addCase(fetchMembers.rejected,  (s, a) => { 
        s.loading = false; 
        if (a.payload !== "Canceled") {
          s.error = a.payload as string; 
        }
      });
  },
});

export const { clearMembersError } = membersSlice.actions;
export default membersSlice.reducer;
