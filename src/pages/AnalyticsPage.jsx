import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AnalyticsPage() {
  const [data, setData] = useState({ jobs: [], workers: [], users: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("jobs").select("*"),
      supabase.from("workers").select("*"),
      supabase.from("users").select("*")
    ]).then(([jobs, workers, users]) => {
      setData({ jobs: jobs.data||[], workers: workers.data||[], users: users.data||[] });
      setLoading(false);
    });
  }, []);

  const services = ["Electrical","Plumbing","Cleaning","Aircon","Carpentry","Moving","Mechanic","Custom Job"];
  const serviceCounts = services.map(s => ({ name: s, count: data.jobs.filter(j=>j.service===s).length, revenue: data.jobs.filter(j=>j.service===s).reduce((sum,j)=>sum+(Number(j.price)||0),0) })).sort((a,b)=>b.count-a.count);
  const maxCount = Math.max(...serviceCounts.map(s=>s.count), 1);
  const totalRevenue = data.jobs.reduce((s,j)=>s+(Number(j.price)||0),0);
  const completedJobs = data.jobs.filter(j=>j.status==="done").length;
  const conversionRate = data.jobs.length > 0 ? Math.round((completedJobs/data.jobs.length)*100) : 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2>Analytics</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Platform performance overview</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          ["Total revenue", `₱${totalRevenue.toLocaleString()}`, "var(--gold)"],
          ["Completion rate", `${conversionRate}%`, "var(--success)"],
          ["Approved workers", data.workers.filter(w=>w.status==="approved").length, "var(--accent)"],
          ["Total users", data.users.length, "var(--text)"]
        ].map(([l,v,c]) => (
          <div key={l} className="card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{l}</div>
            <div style={{ fontWeight: 700, fontSize: 24, color: c }}>{loading ? "—" : v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Service breakdown */}
        <div className="card fade-in-1">
          <h3 style={{ marginBottom: 16 }}>Jobs by service</h3>
          {loading ? <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Loading...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {serviceCounts.map(s => (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.count} jobs · ₱{s.revenue.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 6, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(s.count/maxCount)*100}%`, background: "var(--accent)", borderRadius: 3, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              ))}
              {serviceCounts.every(s=>s.count===0) && <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No job data yet</div>}
            </div>
          )}
        </div>

        {/* Worker stats */}
        <div className="card fade-in-2">
          <h3 style={{ marginBottom: 16 }}>Worker overview</h3>
          {loading ? <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Loading...</div> : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  ["Approved", data.workers.filter(w=>w.status==="approved").length, "var(--success)"],
                  ["Pending", data.workers.filter(w=>w.status==="pending").length, "var(--warning)"],
                  ["Rejected", data.workers.filter(w=>w.status==="rejected").length, "var(--danger)"],
                  ["Suspended", data.workers.filter(w=>w.status==="suspended").length, "var(--text-muted)"],
                ].map(([l,v,c]) => (
                  <div key={l} style={{ padding: "12px", background: "var(--bg-2)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 22, color: c }}>{v}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "12px 14px", background: "var(--bg-2)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Cities</div>
                {["Iloilo City","Pavia"].map(city => {
                  const count = data.workers.filter(w=>w.city===city).length;
                  return (
                    <div key={city} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{city}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{count} workers</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
