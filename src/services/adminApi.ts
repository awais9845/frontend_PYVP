import api from "./axios";

// GET /api/admin/dashboard
export const getDashboard = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data; // { success, dashboard }
};

// GET /api/admin/statistics
export const getStatistics = async () => {
  const { data } = await api.get("/admin/statistics");
  return data; // { success, statistics }
};

// GET /api/admin/users
export const getAllUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data; // { success, totalUsers, users }
};

// GET /api/admin/applications
export const getAdminApplications = async () => {
  const { data } = await api.get("/admin/applications");
  return data; // { success, totalApplications, applications }
};

// PATCH /api/admin/applications/:id/approve
export const approveApplication = async (id: string) => {
  const { data } = await api.patch(`/admin/applications/${id}/approve`);
  return data;
};

// PATCH /api/admin/applications/:id/reject
export const rejectApplication = async (id: string, reason?: string) => {
  const { data } = await api.patch(`/admin/applications/${id}/reject`, { reason });
  return data;
};

// PATCH /api/admin/users/:id/role
export const assignRole = async (id: string, role: string, portfolio?: string) => {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role, portfolio });
  return data;
};

// DELETE /api/admin/users/:id
export const deleteUser = async (id: string) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};
