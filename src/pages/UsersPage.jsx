import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const filtered = users.filter(u => {
    const matchFilter = filter === "all" || u.role === filter;
    const matchSearch = !search || (u.name||"").toLowerCase().includes(search.toLowerCase()) || (u.phone||"").includes(search);
    return matchFilter && matchSearch;
  });

  const counts = { all: users.length, customer: users.filter(u=>u.role==="customer").length, worker: users.filter(u=>u.role==="worker").length };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2>Users</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{users.length} registered users</p>
        </div>
        <input className="input input-sm" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
      </div>

      <div className="tabs">
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} className={`tab-btn ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
            <span style={{ marginLeft: 6, background: filter===key?"var(--bg-3)":"var(--bg-2)", padding: "1px 6px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{count}</span>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Loading...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No users found</td></tr>}
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar" style={{ width: 30, height: 30, background: "var(--bg-3)", color: "var(--text)", fontSize: 11 }}>
                      {(u.name||"U").substring(0,2).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 500 }}>{u.name || "—"}</div>
                  </div>
                </td>
                <td style={{ color: "var(--text-muted)" }}>{u.phone || "—"}</td>
                <td><span className={`badge ${u.role==="worker"?"badge-success":"badge-accent"}`}>{u.role}</span></td>
                <td style={{ color: "var(--text-muted)" }}>{new Date(u.created_at).toLocaleDateString("en-PH")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
