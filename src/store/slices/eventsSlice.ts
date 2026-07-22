import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as eventService from "../../services/eventApi";

interface EventsState {
  events:  any[];
  loading: boolean;
  error:   string | null;
}

const initialState: EventsState = { events: [], loading: false, error: null };

export const fetchEvents = createAsyncThunk(
  "events/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await eventService.getPublicEvents();
      return data.events || [];
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load events.");
    }
  }
);

export const createEventThunk = createAsyncThunk(
  "events/create",
  async (payload: eventService.EventPayload, { rejectWithValue }) => {
    try {
      const data = await eventService.createEvent(payload);
      return data.event;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to create event.");
    }
  }
);

export const updateEventThunk = createAsyncThunk(
  "events/update",
  async ({ id, payload }: { id: string; payload: Partial<eventService.EventPayload> }, { rejectWithValue }) => {
    try {
      const data = await eventService.updateEvent(id, payload);
      return data.event;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to update event.");
    }
  }
);

export const deleteEventThunk = createAsyncThunk(
  "events/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await eventService.deleteEvent(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to delete event.");
    }
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearEventsError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchEvents.fulfilled, (s, a) => { s.loading = false; s.events = a.payload; })
      .addCase(fetchEvents.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder
      .addCase(createEventThunk.fulfilled, (s, a) => { if (a.payload) s.events.unshift(a.payload); });

    builder
      .addCase(updateEventThunk.fulfilled, (s, a) => {
        if (a.payload) s.events = s.events.map((e) => e._id === a.payload._id ? a.payload : e);
      });

    builder
      .addCase(deleteEventThunk.fulfilled, (s, a) => {
        s.events = s.events.filter((e) => e._id !== a.payload);
      });
  },
});

export const { clearEventsError } = eventsSlice.actions;
export default eventsSlice.reducer;
