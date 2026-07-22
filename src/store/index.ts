import { configureStore } from "@reduxjs/toolkit";
import authReducer         from "./slices/authSlice";
import adminReducer        from "./slices/adminSlice";
import eventsReducer       from "./slices/eventsSlice";
import newsReducer         from "./slices/newsSlice";
import membersReducer      from "./slices/membersSlice";
import applicationsReducer from "./slices/applicationsSlice";

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    admin:        adminReducer,
    events:       eventsReducer,
    news:         newsReducer,
    members:      membersReducer,
    applications: applicationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore file objects in actions (base64 strings are fine, but blob objects are not serializable)
        ignoredActionPaths: ["payload.profileImage", "payload.receipt"],
      },
    }),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
