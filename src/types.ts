// ── Aligned with real MongoDB schemas ─────────────────────────────────────────

export interface ProfileImage {
  secure_url: string;
  public_id:  string;
}

// Matches backend User model
export interface User {
  _id:          string;
  fullName:     string;
  email:        string;
  phoneNumber:  string;
  role:         "applicant" | "member" | "executive" | "manager" | "admin" | "superAdmin" | "user";
  isVerified:   boolean;
  profileImage?: ProfileImage;
  application?: string;     // ref to Application _id
  member?:      string;     // ref to Member _id
  createdAt?:   string;
  updatedAt?:   string;
}

// Matches backend Member model
export interface Member {
  _id:             string;
  user:            User | string;
  membershipId:    string;
  fullName:        string;
  email:           string;
  profileImage?:   string;
  designation:     "Member" | "Executive Member" | "President" | "Vice President" |
                   "Secretary General" | "Deputy Secretary General" | "Chairman" | "Vice Chairman";
  province?:       string;
  district?:       string;
  membershipType:  "General" | "Executive" | "Lifetime";
  membershipStatus:"Active" | "Inactive" | "Suspended" | "Expired";
  joinedAt:        string;
  expiryDate?:     string;
  isVerified:      boolean;
}

// Matches backend Application model
export interface Application {
  _id:               string;
  user:              User | string;
  fullName:          string;
  email:             string;
  cnic:              string;
  education:         string;
  address:           string;
  receipt:           ProfileImage;
  cnicFront?:        ProfileImage;
  cnicBack?:         ProfileImage;
  profileImage?:     ProfileImage;
  applicationStatus: "Pending" | "Under Review" | "Approved" | "Rejected";
  remarks?:          string;
  createdAt?:        string;
  updatedAt?:        string;
}

// Matches backend Event model
export interface Event {
  _id:              string;
  title:            string;
  description:      string;
  eventImage:       string;
  announcedBy:      User | string;
  announcementDate: string;
  eventDate:        string;
  location:         string;
  status:           "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
  isPublished:      boolean;
  createdBy:        User | string;
  createdAt?:       string;
}

// Matches backend News model
export interface News {
  _id:             string;
  title:           string;
  description:     string;
  newsImage:       string;
  publishedBy:     User | string;
  publicationDate: string;
  category:        "Announcement" | "News" | "Press Release" | "Achievement" | "Notice";
  isPublished:     boolean;
  createdBy:       User | string;
  createdAt?:      string;
}

// Public stats shape from GET /api/public/stats
export interface SystemStats {
  totalApplicants:     number;
  approvedMembers:     number;
  pendingReviews:      number;
  rejectedApplications:number;
  executivesCount:     number;
  provincesStats:      Record<string, number>;
}

// Notification (kept for backward compat with context)
export interface Notification {
  id:      string;
  userId:  string;
  title:   string;
  message: string;
  date:    string;
}
