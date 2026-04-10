import { useApp } from "../context/AppContext";

const NAV = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "workers", icon: "👷", label: "Workers" },
  { id: "jobs", icon: "📋", label: "Jobs" },
  { id: "users", icon: "👤", label: "Users" },
  { id: "analytics", icon: "📊", label: "Analytics" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar() {
  const { page, navigate, user, logout } = useApp();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ width: 28, height: 28, background: "var(--text)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff" }}>N</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Need.co</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>Admin Panel</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section">Main</div>
        {NAV.slice(0, 4).map(item => (
          <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="nav-section" style={{ marginTop: 8 }}>Reports</div>
        {NAV.slice(4).map(item => (
          <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* User info */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--radius-md)" }}>
          <div className="avatar" style={{ width: 28, height: 28, background: "var(--bg-3)", color: "var(--text)", fontSize: 11 }}>
            {(user?.user_metadata?.full_name || user?.email || "A").substring(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.user_metadata?.full_name || "Admin"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </div>
          </div>
          <button onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16, padding: 4 }} title="Sign out">⎋</button>
        </div>
      </div>
    </div>
  );
}
