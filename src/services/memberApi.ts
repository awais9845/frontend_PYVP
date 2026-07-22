import api from "./axios";

// GET /api/member   — public
export const getAllMembers = async () => {
  const { data } = await api.get("/member");
  return data; // { success, count, members }
};

// GET /api/member/:id
export const getSingleMember = async (id: string) => {
  const { data } = await api.get(`/member/${id}`);
  return data; // { success, member }
};

// GET /api/public/verify/:query
export const verifyRecord = async (query: string) => {
  const { data } = await api.get(
    `/public/verify/${encodeURIComponent(query.trim())}`
  );
  return data; // { success, verified, member }
};

// GET /api/public/stats
export const getPublicStats = async () => {
  const { data } = await api.get("/public/stats");
  return data;
};
