import api from "./axios";

export interface AssignCabinetPayload {
  memberId: string;
  executiveRole: string;
  status: "Active" | "Inactive";
}

export interface UpdateCabinetPayload {
  executiveRole: string;
  status: "Active" | "Inactive";
}

// GET /api/executive-cabinet
export const getAllExecutiveMembers = async () => {
  const { data } = await api.get("/executive-cabinet");
  return data; // { success, count, members }
};

// GET /api/executive-cabinet/:id
export const getExecutiveMemberById = async (id: string) => {
  const { data } = await api.get(`/executive-cabinet/${id}`);
  return data; // { success, member }
};

// POST /api/executive-cabinet
export const assignExecutiveRole = async (payload: AssignCabinetPayload) => {
  const { data } = await api.post("/executive-cabinet", payload);
  return data; // { success, message, member }
};

// PUT /api/executive-cabinet/:id
export const updateExecutiveRole = async (id: string, payload: UpdateCabinetPayload) => {
  const { data } = await api.put(`/executive-cabinet/${id}`, payload);
  return data; // { success, message, member }
};

// DELETE /api/executive-cabinet/:id
export const removeExecutiveRole = async (id: string) => {
  const { data } = await api.delete(`/executive-cabinet/${id}`);
  return data; // { success, message }
};
