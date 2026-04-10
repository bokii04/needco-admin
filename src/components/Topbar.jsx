import { useState } from "react";
import { useApp } from "../context/AppContext";

const PAGE_TITLES = {
  dashboard: "Dashboard", workers: "Workers", jobs: "Jobs",
  users: "Users", analytics: "Analytics", settings: "Settings"
};

export default function Topbar() {
  const { page } = useApp();
  const [search, setSearch] = useState("");

  return (
    <div className="topbar-admin">
      <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>{PAGE_TITLES[page]}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="search-bar">
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>🔍</span>
          <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ width: 1, height: 20, background: "var(--border)" }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Iloilo City & Pavia</span>
        <span className="badge badge-success">● Live</span>
      </div>
    </div>
  );
}
