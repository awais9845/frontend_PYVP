import api from "./axios";

export interface NewsPayload {
  title: string;
  description: string;
  newsImage: string;
  publishedBy: string;   // User _id
  category?: string;
  isPublished?: boolean;
  author?: string;
  tags?: string[];
  status?: string;
}

// GET /api/news   — public
export const getPublishedNews = async () => {
  const { data } = await api.get("/news");
  return data; // { success, total, news }
};

// GET /api/news/:id
export const getSingleNews = async (id: string) => {
  const { data } = await api.get(`/news/${id}`);
  return data;
};

// GET /api/news/admin/all   — admin only
export const getAllNews = async () => {
  const { data } = await api.get("/news/admin/all");
  return data;
};

// POST /api/news   — admin only
export const createNews = async (payload: NewsPayload) => {
  const { data } = await api.post("/news", payload);
  return data;
};

// PUT /api/news/:id   — admin only
export const updateNews = async (id: string, payload: Partial<NewsPayload>) => {
  const { data } = await api.put(`/news/${id}`, payload);
  return data;
};

// DELETE /api/news/:id   — admin only
export const deleteNews = async (id: string) => {
  const { data } = await api.delete(`/news/${id}`);
  return data;
};

// PATCH /api/news/:id/publish
export const publishNews = async (id: string) => {
  const { data } = await api.patch(`/news/${id}/publish`);
  return data;
};

// PATCH /api/news/:id/unpublish
export const unpublishNews = async (id: string) => {
  const { data } = await api.patch(`/news/${id}/unpublish`);
  return data;
};
