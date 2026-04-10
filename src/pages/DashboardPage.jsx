import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

export default function DashboardPage() {
  const { navigate } = useApp();
  const [stats, setStats] = useState({ users: 0, workers: 0, jobs: 0, revenue: 0, pending: 0, active: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [usersRes, workersRes, jobsRes] = await Promise.all([
      supabase.from("users").select("id", { count: "exact" }),
      supabase.from("workers").select("*"),
      supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(10)
    ]);

    const workers = workersRes.data || [];
    const jobs = jobsRes.data || [];
    const revenue = jobs.reduce((s, j) => s + (Number(j.price) || 0), 0);

    setStats({
      users: usersRes.count || 0,
      workers: workers.length,
      jobs: jobs.length,
      revenue,
      pending: workers.filter(w => w.status === "pending").length,
      active: jobs.filter(j => j.status === "active").length
    });
    setRecentJobs(jobs.slice(0, 6));
    setPendingWorkers(workers.filter(w => w.status === "pending").slice(0, 3));
    setLoading(false);
  };

  const statCards = [
    { label: "Total users", value: stats.users, change: "+12% this week", icon: "👤", color: "var(--accent)" },
    { label: "Active workers", value: stats.workers, change: `${stats.pending} pending approval`, icon: "👷", color: "var(--success)" },
    { label: "Total jobs", value: stats.jobs, change: `${stats.active} active now`, icon: "📋", color: "var(--warning)" },
    { label: "Total revenue", value: `₱${stats.revenue.toLocaleString()}`, change: "10% platform fee", icon: "💰", color: "var(--gold)" },
  ];

  const statusBadge = (s) => {
    const map = { active: "badge-accent", pending: "badge-warning", done: "badge-success", rejected: "badge-danger" };
    return <span className={`badge ${map[s] || "badge-gray"}`}>{s}</span>;
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, marginBottom: 4 }}>Good day! 👋</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Here's what's happening with Need.co today</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("applicants")}>Review applicants →</button>
      </div>

      {/* Stats */}
      <div className="stats-grid fade-in-1">
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div className="stat-label">{s.label}</div>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{loading ? "—" : s.value}</div>
            <div className="stat-change" style={{ color: "var(--text-muted)" }}>{s.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        {/* Recent jobs */}
        <div className="card fade-in-2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Recent jobs</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("jobs")}>View all</button>
          </div>
          {loading ? <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Loading...</div> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Address</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map(job => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 500 }}>{job.service || "—"}</td>
                    <td style={{ color: "var(--text-muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.address || "—"}</td>
                    <td style={{ fontWeight: 600 }}>₱{job.price || 0}</td>
                    <td>{statusBadge(job.status)}</td>
                    <td style={{ color: "var(--text-muted)" }}>{new Date(job.created_at).toLocaleDateString("en-PH")}</td>
                  </tr>
                ))}
                {recentJobs.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: 24 }}>No jobs yet</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        {/* Pending workers */}
        <div className="card fade-in-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Pending approval</h3>
            {stats.pending > 0 && <span className="badge badge-warning">{stats.pending}</span>}
          </div>
          {pendingWorkers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 13 }}>All workers reviewed</div>
            </div>
          ) : pendingWorkers.map(w => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div className="avatar" style={{ width: 32, height: 32, background: "var(--bg-3)", color: "var(--text)" }}>
                {(w.full_name || "W").substring(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.full_name || "Unknown"}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{w.city} · Score: {w.approval_score}</div>
              </div>
              <button className="btn btn-success btn-xs" onClick={() => navigate("applicants")}>Review</button>
            </div>
          ))}
          {stats.pending > 3 && (
            <button className="btn btn-secondary btn-sm" style={{ width: "100%", marginTop: 12 }} onClick={() => navigate("applicants")}>
              View all {stats.pending} pending →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
