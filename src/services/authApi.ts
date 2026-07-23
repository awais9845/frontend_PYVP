import api from "./axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  cnic?: string;
  phone?: string;
  province?: string;
  constituency?: string;
  gender?: string;
  dob?: string;
  education?: string;
  bio?: string;
  paymentReceipt?: string;
  documentUrl?: string;
  profilePic?: string;
}

export interface UpdateProfilePayload {
  phoneNumber?: string;
  profileImage?: { secure_url: string; public_id: string };
}

// POST /api/auth/login
export const loginUser = async (payload: LoginPayload) => {
  const { data } = await api.post("/auth/login", payload);
  return data; // { success, message, User, accessToken }
};

// POST /api/auth/register
export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await api.post("/auth/register", payload);
  return data; // { success, message, accessToken, User }
};

// POST /api/auth/logout
export const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

// PUT /api/auth/profile
export const updateProfile = async (payload: UpdateProfilePayload) => {
  const { data } = await api.put("/auth/profile", payload);
  return data; // { success, message, user }
};

// GET /api/auth/me
export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data; // { success, user }
};

// Helper: Check if a user has the Chairman role
export const isChairmanUser = (user: any): boolean => {
  if (!user) return false;
  const role = String(user.role || "").toLowerCase();
  const email = String(user.email || "").toLowerCase();
  const desig = user.member ? String((user.member as any).designation || "").toLowerCase() : "";
  const execRole = user.member ? String((user.member as any).executiveRole || "").toLowerCase() : "";
  const execPos = String((user as any).executivePosition || "").toLowerCase();

  return (
    role === "chairman" ||
    email === "chairman@pyvp.gov.pk" ||
    desig === "chairman" ||
    execRole === "chairman" ||
    execPos.includes("chairman")
  );
};
