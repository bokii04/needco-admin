import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function NotificationsPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ target: "all", userId: "", title: "", body: "", type: "general" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    supabase.from("users").select("id, name, role").then(({ data }) => { if (data) setUsers(data); });
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20).then(({ data }) => { if (data) setHistory(data); });
  }, []);

  const send = async () => {
    setLoading(true);
    try {
      if (form.target === "all") {
        const inserts = users.map(u => ({ user_id: u.id, title: form.title, body: form.body, type: form.type }));
        await supabase.from("notifications").insert(inserts);
      } else if (form.target === "workers") {
        const workers = users.filter(u => u.role === "worker");
        await supabase.from("notifications").insert(workers.map(u => ({ user_id: u.id, title: form.title, body: form.body, type: form.type })));
      } else if (form.target === "customers") {
        const customers = users.filter(u => u.role === "customer");
        await supabase.from("notifications").insert(customers.map(u => ({ user_id: u.id, title: form.title, body: form.body, type: form.type })));
      } else if (form.target === "specific" && form.userId) {
        await supabase.from("notifications").insert({ user_id: form.userId, title: form.title, body: form.body, type: form.type });
      }
      setSent(true);
      setForm(f => ({ ...f, title: "", body: "" }));
      setTimeout(() => setSent(false), 3000);
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20);
      if (data) setHistory(data);
    } catch(e) {}
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h2>Notifications</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Send notifications to users and workers</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Send form */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Send notification</h3>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Send to</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[["all","All users"],["workers","Workers only"],["customers","Customers only"],["specific","Specific user"]].map(([val, label]) => (
                <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                  <input type="radio" name="target" value={val} checked={form.target===val} onChange={e=>setForm(f=>({...f,target:e.target.value}))} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {form.target === "specific" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Select user</label>
              <select className="input input-sm" value={form.userId} onChange={e=>setForm(f=>({...f,userId:e.target.value}))}>
                <option value="">Choose user...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Type</label>
            <select className="input input-sm" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
              {["general","job_request","payment","review","system"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Title</label>
            <input className="input input-sm" placeholder="Notification title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Message</label>
            <textarea className="input" rows={3} placeholder="Notification message..." value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} style={{ resize: "none" }} />
          </div>

          {sent && (
            <div style={{ background: "var(--success-light)", color: "var(--success)", padding: "10px 12px", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
              ✅ Notification sent successfully!
            </div>
          )}

          <button className="btn btn-primary" disabled={!form.title || !form.body || loading} onClick={send}>
            {loading ? "Sending..." : "Send notification →"}
          </button>
        </div>

        {/* History */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Recent notifications</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
            {history.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 13 }}>No notifications sent yet</div>}
            {history.map(n => (
              <div key={n.id} style={{ padding: "10px 12px", background: "var(--bg-2)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--accent)" }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{n.body}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className={`badge badge-${n.type==="general"?"gray":"accent"}`} style={{ fontSize: 10 }}>{n.type}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(n.created_at).toLocaleString("en-PH")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
