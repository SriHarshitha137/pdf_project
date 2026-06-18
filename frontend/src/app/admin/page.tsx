"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";

interface Stats {
  total_users: number;
  total_files: number;
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  processing_jobs: number;
  queued_jobs: number;
}

interface AdminUser {
  id: number;
  email: string;
  plan_type: string;
  created_at: string;
}

interface Job {
  id: number;
  tool_name: string;
  status: string;
  user_id: number;
  created_at: string;
}

interface File {
  id: number;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  user_id: number;
}

const TABS_CONFIG = [
  {
    id: "stats" as const,
    label: "Stats Dashboard",
    icon: (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x={3} y={3} width={7} height={7} />
        <rect x={14} y={3} width={7} height={7} />
        <rect x={14} y={14} width={7} height={7} />
        <rect x={3} y={14} width={7} height={7} />
      </svg>
    )
  },
  {
    id: "users" as const,
    label: "Users List",
    icon: (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx={9} cy={7} r={4} />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    id: "jobs" as const,
    label: "Jobs Queue",
    icon: (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
  },
  {
    id: "files" as const,
    label: "Files Registry",
    icon: (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1={16} y1={13} x2={8} y2={13} />
        <line x1={16} y1={17} x2={8} y2={17} />
      </svg>
    )
  }
];

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "jobs" | "files">("stats");
  const [dataLoading, setDataLoading] = useState(true);
  const [showUnauthorised, setShowUnauthorised] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push("/signin"); return; }
    if (user?.plan_type !== "admin") {
      setShowUnauthorised(true);
      return;
    }

    const fetchAll = async () => {
      try {
        const [statsRes, usersRes, jobsRes, filesRes] = await Promise.all([
          api.get("/api/v1/admin/stats"),
          api.get("/api/v1/admin/users"),
          api.get("/api/v1/admin/jobs"),
          api.get("/api/v1/admin/files"),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setJobs(jobsRes.data);
        setFiles(filesRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAll();
  }, [isLoading, isAuthenticated, user, router]);

  /* ── "You are not authorised" popup for non-admin users ── */
  if (showUnauthorised) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
      }}>
        <div style={{
          background: "var(--bg-2, #1a1a2e)", border: "1px solid var(--border, #333)",
          borderRadius: 16, padding: "40px 36px", maxWidth: 400, width: "90%",
          textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          animation: "popIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {/* Shield icon */}
          <div style={{
            width: 64, height: 64, margin: "0 auto 20px", borderRadius: "50%",
            background: "rgba(217, 79, 79, 0.12)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#D94F4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <line x1={12} y1={8} x2={12} y2={12} />
              <line x1={12} y1={16} x2={12.01} y2={16} />
            </svg>
          </div>
          <h2 style={{
            fontSize: 20, fontWeight: 700, color: "var(--text, #fff)",
            margin: "0 0 8px", fontFamily: "var(--font-sans, system-ui)",
          }}>
            Access Denied
          </h2>
          <p style={{
            fontSize: 14, color: "var(--muted, #888)", lineHeight: 1.5,
            margin: "0 0 28px", fontFamily: "var(--font-sans, system-ui)",
          }}>
            You are not authorised to view this page.<br />
            Only administrators can access the Admin Dashboard.
          </p>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "12px 32px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-sans, system-ui)",
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.3)";
            }}
          >
            Go to Home
          </button>
        </div>

        {/* Pop-in animation */}
        <style>{`
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.85) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  if (isLoading || dataLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <svg className="admin-spin" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1={12} y1={2} x2={12} y2={6} />
          <line x1={12} y1={18} x2={12} y2={22} />
          <line x1={4.93} y1={4.93} x2={7.76} y2={7.76} />
          <line x1={16.24} y1={16.24} x2={19.07} y2={19.07} />
          <line x1={2} y1={12} x2={6} y2={12} />
          <line x1={18} y1={12} x2={22} y2={12} />
          <line x1={4.93} y1={19.07} x2={7.76} y2={16.24} />
          <line x1={16.24} y1={7.76} x2={19.07} y2={4.93} />
        </svg>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)" }}>Hydrating Dashboard data...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.plan_type !== "admin") return null;

  const statsConfig = stats ? [
    {
      label: "Total Users",
      value: stats.total_users,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx={9} cy={7} r={4} />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      label: "Total Files",
      value: stats.total_files,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    },
    {
      label: "Total Jobs",
      value: stats.total_jobs,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      )
    },
    {
      label: "Completed Jobs",
      value: stats.completed_jobs,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    },
    {
      label: "Failed Jobs",
      value: stats.failed_jobs,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D94F4F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
          <line x1={12} y1={8} x2={12} y2={12} />
          <line x1={12} y1={16} x2={12.01} y2={16} />
        </svg>
      )
    },
    {
      label: "Processing Jobs",
      value: stats.processing_jobs,
      icon: (
        <svg className="admin-spin" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#2980B9" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1={12} y1={2} x2={12} y2={6} />
          <line x1={12} y1={18} x2={12} y2={22} />
          <line x1={4.93} y1={4.93} x2={7.76} y2={7.76} />
          <line x1={16.24} y1={16.24} x2={19.07} y2={19.07} />
          <line x1={2} y1={12} x2={6} y2={12} />
          <line x1={18} y1={12} x2={22} y2={12} />
          <line x1={4.93} y1={19.07} x2={7.76} y2={16.24} />
          <line x1={16.24} y1={7.76} x2={19.07} y2={4.93} />
        </svg>
      )
    },
    {
      label: "Queued Jobs",
      value: stats.queued_jobs,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#E67E22" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx={12} cy={12} r={10} />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    }
  ] : [];

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title-wrap">
          <h1>Admin Dashboard</h1>
          <div className="admin-subtitle">
            <span className="admin-subtitle-dot" />
            Authenticated as <strong style={{ color: "var(--text)" }}>{user.email}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS_CONFIG.map((tab) => (
          <button suppressHydrationWarning
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-tab-btn${activeTab === tab.id ? " active" : ""}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Dashboard */}
      {activeTab === "stats" && (
        <div className="admin-stats-grid">
          {statsConfig.map((s) => (
            <div key={s.label} className="admin-stat-card">
              <div className="admin-stat-info">
                <span className="admin-stat-label">{s.label}</span>
                <span className="admin-stat-val">{s.value}</span>
              </div>
              <div className="admin-stat-icon">
                {s.icon}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users List */}
      {activeTab === "users" && (
        <div className="admin-table-card">
          <div className="admin-table-header">
            <div>
              <div className="admin-table-title">System Users</div>
              <div className="admin-table-subtitle">Profiles registered in PDFKit database</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
              {users.length} users registered
            </span>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email Address</th>
                  <th>Plan Tier</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>#{u.id}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-badge ${u.plan_type === "admin" ? "admin-badge-danger" : "admin-badge-default"}`}>
                        {u.plan_type}
                      </span>
                    </td>
                    <td style={{ color: "var(--muted)" }}>
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jobs Queue */}
      {activeTab === "jobs" && (
        <div className="admin-table-card">
          <div className="admin-table-header">
            <div>
              <div className="admin-table-title">Jobs Queue</div>
              <div className="admin-table-subtitle">Background tasks and conversion statuses</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
              {jobs.length} jobs total
            </span>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Tool Used</th>
                  <th>Queue Status</th>
                  <th>User ID</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => {
                  let badgeClass = "admin-badge-default";
                  if (j.status === "completed") badgeClass = "admin-badge-success";
                  else if (j.status === "failed") badgeClass = "admin-badge-danger";
                  else if (j.status === "processing") badgeClass = "admin-badge-info";
                  else if (j.status === "queued" || j.status === "pending") badgeClass = "admin-badge-warning";

                  return (
                    <tr key={j.id}>
                      <td style={{ fontWeight: 600 }}>#{j.id}</td>
                      <td style={{ textTransform: "capitalize" }}>{j.tool_name.replace("-", " ")}</td>
                      <td>
                        <span className={`admin-badge ${badgeClass}`}>
                          {j.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted)" }}>User #{j.user_id}</td>
                      <td style={{ color: "var(--muted)" }}>
                        {new Date(j.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Files Registry */}
      {activeTab === "files" && (
        <div className="admin-table-card">
          <div className="admin-table-header">
            <div>
              <div className="admin-table-title">Uploaded Files</div>
              <div className="admin-table-subtitle">Recent files stored for conversion tasks</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
              {files.length} uploads tracked
            </span>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>File ID</th>
                  <th>Original Filename</th>
                  <th>MIME Type</th>
                  <th>Size</th>
                  <th>Owner ID</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>#{f.id}</td>
                    <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {f.original_filename}
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-default" style={{ textTransform: "none" }}>
                        {f.mime_type}
                      </span>
                    </td>
                    <td style={{ color: "var(--muted)" }}>
                      {(f.size_bytes / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td style={{ color: "var(--muted)" }}>User #{f.user_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}