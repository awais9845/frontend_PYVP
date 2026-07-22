import api from "./axios";

export interface AnnouncementPayload {
  title: string;
  description: string;
}

// Chairman Stats & Roster Operations
export const getOverviewStats = async () => {
  const { data } = await api.get("/chairman/stats");
  return data;
};

export const getMembers = async (params: { search?: string; status?: string; page?: number; limit?: number }) => {
  const { data } = await api.get("/chairman/members", { params });
  return data;
};

export const updateMemberStatus = async (id: string, status: string) => {
  const { data } = await api.put(`/chairman/members/${id}/status`, { status });
  return data;
};

export const removeMember = async (id: string) => {
  const { data } = await api.delete(`/chairman/members/${id}`);
  return data;
};

export const resetMemberPermissions = async (id: string) => {
  const { data } = await api.put(`/chairman/members/${id}/permissions`);
  return data;
};

export const getApplications = async (params: { search?: string; status?: string; page?: number; limit?: number }) => {
  const { data } = await api.get("/chairman/applications", { params });
  return data;
};

export const updateApplicationStatus = async (id: string, status: string, remarks?: string) => {
  const { data } = await api.put(`/chairman/applications/${id}/status`, { status, remarks });
  return data;
};

export const getHomepageContent = async () => {
  const { data } = await api.get("/chairman/homepage-content");
  return data;
};

export const updateHomepageContent = async (payload: any) => {
  const { data } = await api.put("/chairman/homepage-content", payload);
  return data;
};

export const getActivityLogs = async () => {
  const { data } = await api.get("/chairman/activity-logs");
  return data;
};

export const getNotifications = async () => {
  const { data } = await api.get("/chairman/notifications");
  return data;
};

export const markNotificationsAsRead = async () => {
  const { data } = await api.put("/chairman/notifications/read");
  return data;
};

// Announcement Operations
export const getAnnouncement = async () => {
  const { data } = await api.get("/announcement");
  return data; // { success, announcement }
};

export const createOrUpdateAnnouncement = async (payload: AnnouncementPayload) => {
  const { data } = await api.post("/announcement", payload);
  return data; // { success, message, announcement }
};

export const deleteAnnouncement = async (id: string) => {
  const { data } = await api.delete(`/announcement/${id}`);
  return data; // { success, message }
};
