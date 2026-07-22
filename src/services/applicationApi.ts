import api from "./axios";

export interface ApplicationPayload {
  user: string;            // MongoDB User _id
  fullName: string;
  email: string;
  cnic: string;
  education: string;
  address: string;
  receipt: {
    secure_url: string;
    public_id: string;
  };
  cnicFront?: { secure_url: string; public_id: string };
  cnicBack?: { secure_url: string; public_id: string };
  profileImage?: { secure_url: string; public_id: string };
}

// POST /api/app   — Submit new membership application
export const submitApplication = async (payload: ApplicationPayload) => {
  const { data } = await api.post("/app", payload);
  return data; // { success, message, application }
};

// GET /api/app/:id   — Fetch one application
export const getApplication = async (id: string) => {
  const { data } = await api.get(`/app/${id}`);
  return data; // { success, application }
};

// GET /api/app/      — Fetch all applications (admin/executive only)
export const getAllApplications = async () => {
  const { data } = await api.get("/app/");
  return data; // { success, count, applications }
};
