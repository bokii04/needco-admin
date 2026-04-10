import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase.from("jobs").update({ status }).eq("id", id);
    fetchJobs();
  };

  const filtered = jobs.filter(j => {
    const matchFilter = filter === "all" || j.status === filter;
    const matchSearch = !search || (j.service||"").toLowerCase().includes(search.toLowerCase()) || (j.address||"").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusBadge = (s) => {
    const map = { active: "badge-accent", pending: "badge-warning", done: "badge-success", cancelled: "badge-danger" };
    return <span className={`badge ${map[s] || "badge-gray"}`}>{s}</span>;
  };

  const counts = { all: jobs.length, pending: jobs.filter(j=>j.status==="pending").length, active: jobs.filter(j=>j.status==="active").length, done: jobs.filter(j=>j.status==="done").length };
  const totalRevenue = jobs.filter(j=>j.status==="done").reduce((s,j) => s+(Number(j.price)||0), 0);

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2>Jobs</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
            {jobs.length} total · ₱{totalRevenue.toLocaleString()} revenue
          </p>
        </div>
        <input className="input input-sm" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[["Pending", counts.pending, "var(--warning)"], ["Active", counts.active, "var(--accent)"], ["Completed", counts.done, "var(--success)"], ["Revenue", `₱${totalRevenue.toLocaleString()}`, "var(--gold)"]].map(([l,v,c]) => (
          <div key={l} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{l}</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} className={`tab-btn ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
            {count > 0 && <span style={{ marginLeft: 6, background: filter===key?"var(--bg-3)":"var(--bg-2)", padding: "1px 6px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{count}</span>}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Description</th>
              <th>Address</th>
              <th>Price</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Loading...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No jobs found</td></tr>}
            {filtered.map(job => (
              <tr key={job.id}>
                <td style={{ fontWeight: 500 }}>{job.service || "—"}</td>
                <td style={{ color: "var(--text-muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.description || "—"}</td>
                <td style={{ color: "var(--text-muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.address || "—"}</td>
                <td style={{ fontWeight: 600 }}>₱{job.price || 0}</td>
                <td>{statusBadge(job.status)}</td>
                <td style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>{new Date(job.created_at).toLocaleDateString("en-PH")}</td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    {job.status === "pending" && <button className="btn btn-success btn-xs" onClick={() => updateStatus(job.id, "active")}>Activate</button>}
                    {job.status === "active" && <button className="btn btn-secondary btn-xs" onClick={() => updateStatus(job.id, "done")}>Complete</button>}
                    {(job.status === "pending" || job.status === "active") && <button className="btn btn-danger btn-xs" onClick={() => updateStatus(job.id, "cancelled")}>Cancel</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
