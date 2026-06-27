export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  cnic: string;
  province: string;
  constituency: string;
  gender: string;
  dob: string;
  education: string;
  bio: string;
  status: "pending" | "approved" | "rejected";
  role: "member" | "admin" | "executive";
  executivePosition?: string;
  paymentReceipt?: string;
  documentUrl?: string;
  profilePic?: string;
  appliedAt: string;
  approvedAt?: string;
  membershipId?: string;
  certificateNumber?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: "upcoming" | "completed";
  image?: string;
}

export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: "Announcement" | "Press Release" | "Legislative Update";
  image?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
}

export interface SystemStats {
  totalApplicants: number;
  approvedMembers: number;
  pendingReviews: number;
  rejectedApplications: number;
  provincesStats: Record<string, number>;
  executivesCount: number;
}
