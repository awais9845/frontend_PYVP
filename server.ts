import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Body parsers are conditionally loaded below to prevent consuming request streams before proxying.

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, "db.json");

// Helper interfaces
interface User {
  id: string; // Will be PYVP-YYYY-XXXX upon approval, or random UUID for pending
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
  passwordHash: string;
  status: "pending" | "approved" | "rejected";
  role: "member" | "admin" | "executive";
  executivePosition?: string;
  paymentReceipt?: string; // Base64
  documentUrl?: string; // Base64
  profilePic?: string; // Base64
  appliedAt: string;
  approvedAt?: string;
  membershipId?: string;
  certificateNumber?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: "upcoming" | "completed";
  image?: string;
}

interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: "Announcement" | "Press Release" | "Legislative Update";
  image?: string;
}

interface Notification {
  id: string;
  userId: string; // "all" or specific user ID
  title: string;
  message: string;
  date: string;
}

interface Database {
  users: User[];
  events: Event[];
  news: News[];
  notifications: Notification[];
}

// Initial seed data
const initialDb: Database = {
  users: [
    {
      id: "ADMIN-01",
      email: "admin@pyvp.gov.pk",
      fullName: "PYVP Administration",
      phone: "+92 300 0000000",
      cnic: "37405-0000000-1",
      province: "Islamabad Capital Territory",
      constituency: "NA-48",
      gender: "Male",
      dob: "1990-01-01",
      education: "Master of Public Policy",
      bio: "Official Administrator Account for the Pakistan Youth Vision Parliament Portal.",
      passwordHash: "admin123", // For simplicity in this demo, checked directly
      status: "approved",
      role: "admin",
      appliedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      membershipId: "PYVP-ADMIN"
    },
    {
      id: "EXE-01",
      email: "chairman@pyvp.gov.pk",
      fullName: "Syed Hammad Hassan",
      phone: "+92 321 5551234",
      cnic: "35201-1234567-1",
      province: "Punjab",
      constituency: "NA-120",
      gender: "Male",
      dob: "1994-05-15",
      education: "M.Phil Political Science",
      bio: "Chairman of the Pakistan Youth Vision Parliament. Dedicated to enabling youth representation and national leadership frameworks across Pakistan.",
      passwordHash: "chairman123",
      status: "approved",
      role: "executive",
      executivePosition: "Chairman PYVP",
      appliedAt: "2025-10-01T08:00:00.000Z",
      approvedAt: "2025-10-05T12:00:00.000Z",
      membershipId: "PYVP-2025-0001",
      certificateNumber: "PYVP-CERT-250001",
      profilePic: "" // We will handle placeholders beautifully in frontend
    },
    {
      id: "EXE-02",
      email: "waqarkhattak844@gmail.com",
      fullName: "Waqar Ahmad Khattak",
      phone: "+92 334 9876543",
      cnic: "11101-1234567-3",
      province: "Khyber Pakhtunkhwa",
      constituency: "NA-28",
      gender: "Male",
      dob: "1999-08-12",
      education: "B.Sc. Software Engineering",
      bio: "Youth Prime Minister of the PYVP. Tech-driven public servant aiming to build digital parliamentary processes for Pakistan.",
      passwordHash: "waqarkhattak",
      status: "approved",
      role: "executive",
      executivePosition: "Youth Prime Minister",
      appliedAt: "2025-10-02T09:00:00.000Z",
      approvedAt: "2025-10-05T12:30:00.000Z",
      membershipId: "PYVP-2025-0002",
      certificateNumber: "PYVP-CERT-250002",
      profilePic: ""
    },
    {
      id: "EXE-03",
      email: "ayeshamalik@pyvp.gov.pk",
      fullName: "Ayesha Malik",
      phone: "+92 301 2223344",
      cnic: "42101-9876543-2",
      province: "Sindh",
      constituency: "NA-244",
      gender: "Female",
      dob: "1998-11-20",
      education: "LL.B. Honours",
      bio: "Speaker of the Youth Assembly. Advocating for parliamentary discipline and strong youth integration in legal frameworks.",
      passwordHash: "ayesha123",
      status: "approved",
      role: "executive",
      executivePosition: "Speaker Youth Assembly",
      appliedAt: "2025-10-02T10:15:00.000Z",
      approvedAt: "2025-10-05T12:45:00.000Z",
      membershipId: "PYVP-2025-0003",
      certificateNumber: "PYVP-CERT-250003",
      profilePic: ""
    }
  ],
  events: [
    {
      id: "evt-01",
      title: "Model Pakistan Youth Parliament Simulation",
      description: "A comprehensive 3-day simulated legislative workshop in Islamabad. Selected members from all provinces will draft, debate, and pass mock youth-focused resolutions regarding economic reforms, educational access, and IT infrastructure development.",
      date: "2026-08-15",
      location: "Prime Minister Youth Secretariat / National Assembly Hall, Islamabad",
      status: "upcoming"
    },
    {
      id: "evt-02",
      title: "National Youth Leadership & Policy Summit",
      description: "A prestigious assembly connecting Pakistan's youth leaders with veteran parliamentarians, federal ministers, and policy experts. Key topics include digital governance, public-private partnerships, and green initiatives.",
      date: "2026-09-22",
      location: "Convention Centre, Islamabad",
      status: "upcoming"
    },
    {
      id: "evt-03",
      title: "PYVP Youth Assembly Inaugural Session 2025",
      description: "The official swearing-in ceremony and constitutional drafting workshop for the newly selected executive cabinet of Pakistan Youth Vision Parliament.",
      date: "2025-10-15",
      location: "Youth Assembly Hall, Lahore",
      status: "completed"
    }
  ],
  news: [
    {
      id: "news-01",
      title: "Pakistan Youth Vision Parliament Portal Launched",
      summary: "PYVP introduces an all-new digital system to steamline youth registration, application review, digital ID card issuance, and verification.",
      content: "Islamabad — In a historic step towards modernizing digital youth governance, the Chairman of the Pakistan Youth Vision Parliament (PYVP) has officially inaugurated the customized digital web portal. The system features streamlined application forms, dynamic verification portals with digital QR codes, custom member dashboards, and secure administrator reviews. 'This portal bridges the gap between state governance and youth ambition, making registration transparent and swift,' noted Syed Hammad Hassan during the press conference.",
      date: "2026-06-25",
      category: "Announcement"
    },
    {
      id: "news-02",
      title: "Youth PM Waqar Ahmad Khattak Outlines Tech Strategy",
      summary: "The newly inducted Youth Prime Minister of PYVP details plans to establish nationwide digital youth councils and tech-incubator access.",
      content: "Peshawar — Youth Prime Minister Waqar Ahmad Khattak has issued his executive tech directive, focusing on utilizing technology to expand PYVP's legislative feedback loop. Under the proposed plan, a dedicated feedback platform will collect youth opinions on cybersecurity, regional education policies, and job placement. 'We will ensure Pakistan's youth are not just users of technology, but architects of the regional governance that supports it,' Khattak emphasized in his state briefing.",
      date: "2026-06-26",
      category: "Legislative Update"
    },
    {
      id: "news-03",
      title: "Applications Open for National Youth Intake 2026",
      summary: "Young Pakistani citizens aged 18 to 32 are invited to apply for the upcoming simulated parliamentary term. Registration closes soon.",
      content: "National — The Pakistan Youth Vision Parliament has opened public registrations for the 2026 legislative sessions. Eligible candidates from Balochistan, Khyber Pakhtunkhwa, Punjab, Sindh, Gilgit-Baltistan, AJK, and Islamabad can submit their credentials via the official portal. Applicants will submit an official document (CNIC/B-Form) along with their nomination essay and EasyPaisa registration fee receipt. Selected applicants will receive official digital certificates and ID cards enabling full floor access.",
      date: "2026-06-20",
      category: "Press Release"
    }
  ],
  notifications: [
    {
      id: "notif-01",
      userId: "all",
      title: "Intake 2026 Active",
      message: "Public applications are now open for the 2026 Youth Assembly Session. Please complete your registration and upload the required EasyPaisa payment receipt to proceed.",
      date: "2026-06-25T10:00:00.000Z"
    }
  ]
};

// Database helper functions (Synchronous or Promise-based to avoid file corruption)
function readDb(): Database {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Database reading error, using initial state:", error);
    return initialDb;
  }
}

function writeDb(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Database saving error:", error);
  }
}

// ================= API ENDPOINTS =================
if (process.env.NODE_ENV === "production" || process.env.USE_MOCK === "true") {
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));
  console.log("🚀 Mock API Endpoints active in server.ts");

// 1. Auth Endpoints
app.post("/api/auth/register", (req, res) => {
  try {
    const { fullName, email, phone, cnic, province, constituency, gender, dob, education, bio, password, paymentReceipt, documentUrl, profilePic } = req.body;
    
    if (!fullName || !email || !cnic || !password) {
      return res.status(400).json({ error: "Missing required fields (fullName, email, cnic, password)" });
    }

    const db = readDb();
    
    // Check if email or CNIC already registered
    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.cnic === cnic);
    if (exists) {
      return res.status(400).json({ error: "Email or CNIC already registered under another application" });
    }

    const newUser: User = {
      id: "PEND-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      email: email.toLowerCase(),
      fullName,
      phone: phone || "",
      cnic,
      province: province || "Punjab",
      constituency: constituency || "N/A",
      gender: gender || "Other",
      dob: dob || "",
      education: education || "",
      bio: bio || "",
      passwordHash: password, // Store plainly for simple local validation
      status: "pending",
      role: "member",
      paymentReceipt: paymentReceipt || "",
      documentUrl: documentUrl || "",
      profilePic: profilePic || "",
      appliedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDb(db);

    // Create a specific user notification
    const newNotif: Notification = {
      id: "notif-" + Math.random().toString(36).substring(2, 6),
      userId: newUser.id,
      title: "Application Received",
      message: "Your application for the Pakistan Youth Vision Parliament has been received. Our administration will verify your EasyPaisa receipt and academic credentials within 48-72 hours.",
      date: new Date().toISOString()
    };
    db.notifications.push(newNotif);
    writeDb(db);

    res.status(201).json({
      message: "Application submitted successfully",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        status: newUser.status,
        role: newUser.role
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Internal server error during registration" });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password" });
    }

    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid email or password credentials" });
    }

    // Return profile with passwordHash omitted
    const { passwordHash, ...safeUser } = user;
    res.json({
      message: "Login successful",
      user: safeUser,
      token: "mock-jwt-token-for-" + user.id
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Internal server error during login" });
  }
});

// Update profile info (from member dashboard)
app.put("/api/auth/profile", (req, res) => {
  try {
    const { userId, phone, education, bio, profilePic } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required to update profile" });
    }

    const db = readDb();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) {
      return res.status(404).json({ error: "User account not found" });
    }

    const user = db.users[index];
    if (phone !== undefined) user.phone = phone;
    if (education !== undefined) user.education = education;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;

    db.users[index] = user;
    writeDb(db);

    const { passwordHash, ...safeUser } = user;
    res.json({
      message: "Profile updated successfully",
      user: safeUser
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Internal server error during profile update" });
  }
});

// 2. Public Statistics
app.get("/api/public/stats", (req, res) => {
  try {
    const db = readDb();
    const totalUsers = db.users.length;
    const approved = db.users.filter(u => u.status === "approved" && u.role !== "admin");
    const pending = db.users.filter(u => u.status === "pending").length;
    const rejected = db.users.filter(u => u.status === "rejected").length;
    
    // Provinces representation
    const provincesMap: Record<string, number> = {};
    approved.forEach(u => {
      provincesMap[u.province] = (provincesMap[u.province] || 0) + 1;
    });

    res.json({
      totalApplicants: totalUsers - 1, // minus admin
      approvedMembers: approved.length,
      pendingReviews: pending,
      rejectedApplications: rejected,
      provincesStats: provincesMap,
      executivesCount: db.users.filter(u => u.role === "executive").length
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Error reading stats" });
  }
});

// 3. Events Endpoints
app.get("/api/public/events", (req, res) => {
  const db = readDb();
  res.json(db.events);
});

app.post("/api/admin/events", (req, res) => {
  try {
    const { title, description, date, location, status } = req.body;
    if (!title || !description || !date || !location) {
      return res.status(400).json({ error: "Please fill all event fields" });
    }

    const db = readDb();
    const newEvent: Event = {
      id: "evt-" + Date.now(),
      title,
      description,
      date,
      location,
      status: status || "upcoming"
    };

    db.events.unshift(newEvent);
    writeDb(db);

    // Also push a global notification about this event
    const newNotif: Notification = {
      id: "notif-" + Math.random().toString(36).substring(2, 6),
      userId: "all",
      title: `New Event Scheduled: ${title}`,
      message: `The Pakistan Youth Vision Parliament has scheduled a new event on ${date} at ${location}. Members are encouraged to apply for representation.`,
      date: new Date().toISOString()
    };
    db.notifications.push(newNotif);
    writeDb(db);

    res.status(201).json(newEvent);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/events/:id", (req, res) => {
  try {
    const db = readDb();
    const initialLen = db.events.length;
    db.events = db.events.filter(e => e.id !== req.params.id);
    
    if (db.events.length === initialLen) {
      return res.status(404).json({ error: "Event not found" });
    }
    writeDb(db);
    res.json({ message: "Event removed successfully" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 4. News Endpoints
app.get("/api/public/news", (req, res) => {
  const db = readDb();
  res.json(db.news);
});

app.post("/api/admin/news", (req, res) => {
  try {
    const { title, summary, content, category } = req.body;
    if (!title || !summary || !content) {
      return res.status(400).json({ error: "Please fill all news fields" });
    }

    const db = readDb();
    const newNews: News = {
      id: "news-" + Date.now(),
      title,
      summary,
      content,
      category: category || "Announcement",
      date: new Date().toISOString().split("T")[0]
    };

    db.news.unshift(newNews);
    writeDb(db);

    res.status(201).json(newNews);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/news/:id", (req, res) => {
  try {
    const db = readDb();
    const initialLen = db.news.length;
    db.news = db.news.filter(n => n.id !== req.params.id);
    
    if (db.news.length === initialLen) {
      return res.status(404).json({ error: "News not found" });
    }
    writeDb(db);
    res.json({ message: "News item removed successfully" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 5. Admin Panel Management
app.get("/api/admin/applications", (req, res) => {
  const db = readDb();
  // Return all applicants with passwords removed
  const safeUsers = db.users
    .filter(u => u.role !== "admin")
    .map(({ passwordHash, ...u }) => u);
  res.json(safeUsers);
});

app.post("/api/admin/applications/:id/review", (req, res) => {
  try {
    const { id } = req.params;
    const { status, role, executivePosition } = req.body; // status: 'approved' | 'rejected'

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Review status must be 'approved' or 'rejected'" });
    }

    const db = readDb();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Application not found" });
    }

    const user = db.users[index];
    user.status = status;
    user.approvedAt = new Date().toISOString();

    if (status === "approved") {
      // Generate standard Member ID and Certificate Number
      const year = new Date().getFullYear();
      const seq = String(db.users.filter(u => u.status === "approved" && u.membershipId).length + 1).padStart(4, "0");
      user.membershipId = `PYVP-${year}-${seq}`;
      user.certificateNumber = `PYVP-CERT-${year}${seq}`;
      if (role) {
        user.role = role; // e.g. 'member' or 'executive'
      }
      if (executivePosition) {
        user.executivePosition = executivePosition;
      }
    } else {
      user.membershipId = undefined;
      user.certificateNumber = undefined;
    }

    db.users[index] = user;
    writeDb(db);

    // Notify user of decision
    const decisionMessage = status === "approved"
      ? `Congratulations! Your membership in the Pakistan Youth Vision Parliament has been APPROVED. Your Membership ID is ${user.membershipId}. You can now access your Member Dashboard to view notifications and generate your official digital ID Card.`
      : `We regret to inform you that your application for the Pakistan Youth Vision Parliament was not approved at this time. This may be due to incomplete academic document verification or unverified fee receipts. If you believe this is an error, please contact support.`;

    const newNotif: Notification = {
      id: "notif-" + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      title: status === "approved" ? "Membership Approved!" : "Application Status Update",
      message: decisionMessage,
      date: new Date().toISOString()
    };
    db.notifications.push(newNotif);
    writeDb(db);

    res.json({
      message: `Application has been ${status}`,
      user: {
        id: user.id,
        fullName: user.fullName,
        status: user.status,
        membershipId: user.membershipId,
        certificateNumber: user.certificateNumber
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/members/:id", (req, res) => {
  try {
    const db = readDb();
    const initialLen = db.users.length;
    db.users = db.users.filter(u => u.id !== req.params.id);
    
    if (db.users.length === initialLen) {
      return res.status(404).json({ error: "Member not found" });
    }
    writeDb(db);
    res.json({ message: "Member account deleted from records" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/admin/members/:id/role", (req, res) => {
  try {
    const { role, executivePosition } = req.body;
    const db = readDb();
    const index = db.users.findIndex(u => u.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Member not found" });
    }

    db.users[index].role = role || "member";
    if (role === "executive") {
      db.users[index].executivePosition = executivePosition || "Cabinet Member";
    } else {
      db.users[index].executivePosition = undefined;
    }

    writeDb(db);
    res.json({ message: "Member role updated successfully", user: db.users[index] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 6. Public Verification Portal
app.get("/api/public/verify/:query", (req, res) => {
  try {
    const { query } = req.params; // Can be Membership ID (PYVP-YYYY-XXXX) or Certificate Number or full CNIC
    const db = readDb();
    
    const term = query.trim().toUpperCase();
    const user = db.users.find(u => 
      u.status === "approved" && (
        (u.membershipId && u.membershipId.toUpperCase() === term) ||
        (u.certificateNumber && u.certificateNumber.toUpperCase() === term) ||
        (u.cnic && u.cnic.replace(/[-\s]/g, "") === term.replace(/[-\s]/g, ""))
      )
    );

    if (!user) {
      return res.status(404).json({ verified: false, error: "No verified record matches this credential" });
    }

    res.json({
      verified: true,
      member: {
        fullName: user.fullName,
        membershipId: user.membershipId,
        certificateNumber: user.certificateNumber,
        province: user.province,
        constituency: user.constituency,
        role: user.role,
        executivePosition: user.executivePosition || null,
        approvedAt: user.approvedAt,
        education: user.education,
        bio: user.bio,
        profilePic: user.profilePic || null
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 7. Notification Endpoints (User-specific + Public)
app.get("/api/notifications/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const db = readDb();
    const list = db.notifications.filter(n => n.userId === "all" || n.userId === userId);
    res.json(list.reverse()); // latest first
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Admin posts notification
app.post("/api/admin/notifications", (req, res) => {
  try {
    const { title, message, userId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Notification must contain title and message" });
    }

    const db = readDb();
    const newNotif: Notification = {
      id: "notif-" + Math.random().toString(36).substring(2, 6),
      userId: userId || "all",
      title,
      message,
      date: new Date().toISOString()
    };

    db.notifications.push(newNotif);
    writeDb(db);
    res.status(201).json(newNotif);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
} // END OF API ENDPOINTS

// Serve frontend assets and SPA fallback
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite is running in Development mode");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files in Production mode from dist/");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PYVP Full Stack Server running securely on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start full stack server:", err);
});
