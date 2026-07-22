import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as newsService from "../../services/newsApi";

interface NewsState {
  news:    any[];
  loading: boolean;
  error:   string | null;
}

const initialState: NewsState = { news: [], loading: false, error: null };

export const fetchNews = createAsyncThunk(
  "news/fetchPublished",
  async (_, { rejectWithValue }) => {
    try {
      const data = await newsService.getPublishedNews();
      return data.news || [];
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load news.");
    }
  }
);

export const fetchAllNews = createAsyncThunk(
  "news/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await newsService.getAllNews();
      return data.news || [];
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load all news.");
    }
  }
);

export const createNewsThunk = createAsyncThunk(
  "news/create",
  async (payload: newsService.NewsPayload, { rejectWithValue }) => {
    try {
      const data = await newsService.createNews(payload);
      return data.news;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to create news.");
    }
  }
);

export const updateNewsThunk = createAsyncThunk(
  "news/update",
  async ({ id, payload }: { id: string; payload: Partial<newsService.NewsPayload> }, { rejectWithValue }) => {
    try {
      const data = await newsService.updateNews(id, payload);
      return data.news;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to update news.");
    }
  }
);

export const deleteNewsThunk = createAsyncThunk(
  "news/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await newsService.deleteNews(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to delete news.");
    }
  }
);

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    clearNewsError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchNews.fulfilled, (s, a) => { s.loading = false; s.news = a.payload; })
      .addCase(fetchNews.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder
      .addCase(fetchAllNews.pending,   (s) => { s.loading = true; })
      .addCase(fetchAllNews.fulfilled, (s, a) => { s.loading = false; s.news = a.payload; })
      .addCase(fetchAllNews.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder.addCase(createNewsThunk.fulfilled, (s, a) => { if (a.payload) s.news.unshift(a.payload); });
    builder.addCase(updateNewsThunk.fulfilled, (s, a) => {
      if (a.payload) s.news = s.news.map((n) => n._id === a.payload._id ? a.payload : n);
    });
    builder.addCase(deleteNewsThunk.fulfilled, (s, a) => {
      s.news = s.news.filter((n) => n._id !== a.payload);
    });
  },
});

export const { clearNewsError } = newsSlice.actions;
export default newsSlice.reducer;
