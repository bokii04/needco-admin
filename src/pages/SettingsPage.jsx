import { useApp } from "../context/AppContext";

export default function SettingsPage() {
  const { user, logout } = useApp();

  const links = [
    { label: "Customer app", url: "https://needco-customer.vercel.app", desc: "Customer booking portal" },
    { label: "Worker app", url: "https://needco-worker.vercel.app", desc: "Worker job portal" },
    { label: "Supabase dashboard", url: "https://supabase.com/dashboard", desc: "Database & auth management" },
    { label: "Vercel dashboard", url: "https://vercel.com", desc: "Deployment management" },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h2>Settings</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Platform configuration and admin account</p>
      </div>

      {/* Admin profile */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Admin account</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: "14px", background: "var(--bg-2)", borderRadius: "var(--radius-md)" }}>
          <div className="avatar" style={{ width: 44, height: 44, background: "var(--bg-3)", color: "var(--text)", fontSize: 14 }}>
            {(user?.user_metadata?.full_name || "A").substring(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{user?.user_metadata?.full_name || "Admin"}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{user?.email}</div>
          </div>
          <span className="badge badge-success" style={{ marginLeft: "auto" }}>Admin</span>
        </div>
        <button className="btn btn-danger btn-sm" onClick={logout}>Sign out</button>
      </div>

      {/* Platform config */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Platform configuration</h3>
        {[
          ["App name", "Need.co"],
          ["Version", "2.0"],
          ["Coverage", "Iloilo City & Pavia"],
          ["Match radius", "10 km"],
          ["Platform fee", "10%"],
          ["Currency", "PHP (₱)"],
        ].map(([k,v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{k}</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Quick links</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {links.map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-2)", borderRadius: "var(--radius-md)", textDecoration: "none", transition: "background 0.15s" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{link.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{link.desc}</div>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: 16 }}>↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
