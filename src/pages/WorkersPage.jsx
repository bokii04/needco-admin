import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchWorkers(); }, []);

  const fetchWorkers = async () => {
    const { data } = await supabase.from("workers").select("*").order("created_at", { ascending: false });
    if (data) setWorkers(data);
    setLoading(false);
  };

  const approve = async (id) => {
    await supabase.from("workers").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", id);
    fetchWorkers(); setSelected(null);
  };

  const reject = async (id) => {
    await supabase.from("workers").update({ status: "rejected", rejection_reason: "Does not meet requirements" }).eq("id", id);
    fetchWorkers(); setSelected(null);
  };

  const suspend = async (id) => {
    await supabase.from("workers").update({ status: "suspended" }).eq("id", id);
    fetchWorkers(); setSelected(null);
  };

  const reinstate = async (id) => {
    await supabase.from("workers").update({ status: "approved" }).eq("id", id);
    fetchWorkers(); setSelected(null);
  };

  const filtered = workers.filter(w => {
    const matchFilter = filter === "all" || w.status === filter;
    const matchSearch = !search || (w.full_name||"").toLowerCase().includes(search.toLowerCase()) || (w.city||"").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusBadge = (s) => {
    const map = { approved: "badge-success", pending: "badge-warning", rejected: "badge-danger", suspended: "badge-gray" };
    return <span className={`badge ${map[s] || "badge-gray"}`}>{s}</span>;
  };

  const counts = { all: workers.length, pending: workers.filter(w=>w.status==="pending").length, approved: workers.filter(w=>w.status==="approved").length, rejected: workers.filter(w=>w.status==="rejected").length, suspended: workers.filter(w=>w.status==="suspended").length };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2>Workers</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{workers.length} total workers</p>
        </div>
        <input className="input input-sm" placeholder="Search workers..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} className={`tab-btn ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
            {count > 0 && <span style={{ marginLeft: 6, background: filter===key?"var(--bg-3)":"var(--bg-2)", padding: "1px 6px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{count}</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>City</th>
              <th>Skills</th>
              <th>Score</th>
              <th>Rating</th>
              <th>Jobs</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Loading...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No workers found</td></tr>}
            {filtered.map(w => (
              <tr key={w.id} style={{ cursor: "pointer" }} onClick={() => setSelected(w)}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar" style={{ width: 30, height: 30, background: "var(--bg-3)", color: "var(--text)", fontSize: 11 }}>
                      {(w.full_name||"W").substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{w.full_name || "Unknown"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{w.phone || "—"}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--text-muted)" }}>{w.city || "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(w.skills||[]).slice(0,2).map(s => <span key={s} className="badge badge-gray">{s}</span>)}
                    {(w.skills||[]).length > 2 && <span className="badge badge-gray">+{(w.skills||[]).length-2}</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 40, height: 4, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${w.approval_score||0}%`, height: "100%", background: (w.approval_score||0)>=70?"var(--success)":"var(--warning)", borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{w.approval_score||0}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{w.rating||0}★</td>
                <td>{w.total_jobs||0}</td>
                <td>{statusBadge(w.status||"pending")}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {w.status === "pending" && <>
                      <button className="btn btn-success btn-xs" onClick={() => approve(w.id)}>Approve</button>
                      <button className="btn btn-danger btn-xs" onClick={() => reject(w.id)}>Reject</button>
                    </>}
                    {w.status === "approved" && <button className="btn btn-secondary btn-xs" onClick={() => suspend(w.id)}>Suspend</button>}
                    {w.status === "suspended" && <button className="btn btn-success btn-xs" onClick={() => reinstate(w.id)}>Reinstate</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Worker detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.full_name || "Worker details"}</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[["Phone", selected.phone||"—"], ["City", selected.city||"—"], ["Experience", selected.experience||"—"], ["Trust score", `${selected.approval_score||0}/100`], ["Rating", `${selected.rating||0}★`], ["Jobs done", selected.total_jobs||0], ["Status", selected.status||"pending"], ["Applied", new Date(selected.created_at).toLocaleDateString("en-PH")]].map(([k,v]) => (
                <div key={k} style={{ padding: "10px 12px", background: "var(--bg-2)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            {selected.bio && <div style={{ padding: "12px", background: "var(--bg-2)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--text-mid)", marginBottom: 16, fontStyle: "italic" }}>"{selected.bio}"</div>}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
              {(selected.skills||[]).map(s => <span key={s} className="badge badge-accent">{s}</span>)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {selected.status === "pending" && <>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => approve(selected.id)}>✓ Approve</button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => reject(selected.id)}>✗ Reject</button>
              </>}
              {selected.status === "approved" && <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => suspend(selected.id)}>Suspend worker</button>}
              {selected.status === "suspended" && <button className="btn btn-success" style={{ flex: 1 }} onClick={() => reinstate(selected.id)}>Reinstate worker</button>}
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// Notification sending is handled via Supabase directly
