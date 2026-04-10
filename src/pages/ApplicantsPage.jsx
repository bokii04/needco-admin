import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchApplicants(); }, []);

  const fetchApplicants = async () => {
    const { data } = await supabase
      .from("workers")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (data) setApplicants(data);
    setLoading(false);
  };

  const approve = async (worker) => {
    setProcessing(true);
    await supabase.from("workers").update({
      status: "approved",
      approved_at: new Date().toISOString(),
    }).eq("id", worker.id);

    // Send notification to worker
    await supabase.from("notifications").insert({
      user_id: worker.user_id,
      title: "🎉 You're approved!",
      body: "Your Need.co worker application has been approved. You can now go online and start accepting jobs!",
      type: "system",
    });

    await fetchApplicants();
    setSelected(null);
    setProcessing(false);
  };

  const reject = async (worker) => {
    setProcessing(true);
    await supabase.from("workers").update({
      status: "rejected",
      rejection_reason: rejectReason || "Does not meet our current requirements.",
    }).eq("id", worker.id);

    // Send notification to worker
    await supabase.from("notifications").insert({
      user_id: worker.user_id,
      title: "Application update",
      body: `Your application was not approved. Reason: ${rejectReason || "Does not meet requirements"}. You may reapply with updated documents.`,
      type: "system",
    });

    await fetchApplicants();
    setSelected(null);
    setRejecting(false);
    setRejectReason("");
    setProcessing(false);
  };

  const formatDate = (ts) => new Date(ts).toLocaleString("en-PH", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const getHoursAgo = (ts) => {
    const diff = Math.floor((new Date() - new Date(ts)) / (1000 * 60 * 60));
    if (diff < 1) return "Just now";
    if (diff < 24) return `${diff}h ago`;
    return `${Math.floor(diff/24)}d ago`;
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2>New Applicants</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
            {applicants.length} pending review
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchApplicants}>
          🔄 Refresh
        </button>
      </div>

      {/* Alert banner */}
      {applicants.length > 0 && (
        <div style={{ background: "var(--warning-light)", border: "1px solid var(--warning)", borderRadius: "var(--radius-lg)", padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--warning)" }}>
              {applicants.length} worker{applicants.length > 1 ? "s" : ""} waiting for approval
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Review and verify their ID and selfie before approving
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading applicants...</div>}

      {!loading && applicants.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 style={{ marginBottom: 8 }}>All caught up!</h3>
          <p style={{ color: "var(--text-muted)" }}>No pending applications to review</p>
        </div>
      )}

      {/* Applicant cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {applicants.map(w => (
          <div key={w.id} className="card fade-in" style={{ cursor: "pointer", transition: "all 0.15s" }} onClick={() => setSelected(w)}>

            {/* Header */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
              {w.selfie_url ? (
                <img src={w.selfie_url} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }} />
              ) : (
                <div className="avatar" style={{ width: 52, height: 52, background: "var(--bg-3)", color: "var(--text-mid)", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                  {(w.full_name || "W").substring(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{w.full_name || "Unknown"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{w.city} · {getHoursAgo(w.created_at)}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{w.phone || "No phone"}</div>
              </div>
              <span className="badge badge-warning">Pending</span>
            </div>

            {/* Skills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {(w.skills || []).map(s => <span key={s} className="badge badge-gray" style={{ fontSize: 10 }}>{s}</span>)}
            </div>

            {/* ID + Selfie preview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>ID Photo</div>
                {w.id_photo_url ? (
                  <img src={w.id_photo_url} alt="ID" style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                ) : (
                  <div style={{ height: 70, background: "var(--bg-3)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>❌</div>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Selfie</div>
                {w.selfie_url ? (
                  <img src={w.selfie_url} alt="Selfie" style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                ) : (
                  <div style={{ height: 70, background: "var(--bg-3)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>❌</div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); approve(w); }} disabled={processing}>
                ✓ Approve
              </button>
              <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); setSelected(w); setRejecting(true); }} disabled={processing}>
                ✗ Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && !rejecting && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Applicant Details</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)" }}>✕</button>
            </div>

            {/* Photos side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>ID Photo ({selected.id_type})</div>
                {selected.id_photo_url ? (
                  <img src={selected.id_photo_url} alt="ID" style={{ width: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
                ) : (
                  <div style={{ height: 120, background: "var(--bg-2)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>No ID uploaded</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Selfie</div>
                {selected.selfie_url ? (
                  <img src={selected.selfie_url} alt="Selfie" style={{ width: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
                ) : (
                  <div style={{ height: 120, background: "var(--bg-2)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>No selfie uploaded</div>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                ["Full name", selected.full_name || "—"],
                ["Phone", selected.phone || "—"],
                ["City", selected.city || "—"],
                ["Experience", selected.experience || "—"],
                ["Service radius", `${selected.service_radius || 10} km`],
                ["Applied", formatDate(selected.created_at)],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: "10px 12px", background: "var(--bg-2)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Skills</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(selected.skills || []).map(s => <span key={s} className="badge badge-accent">{s}</span>)}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={() => approve(selected)} disabled={processing}>
                ✓ Approve worker
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setRejecting(true)} disabled={processing}>
                ✗ Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      {rejecting && selected && (
        <div className="modal-overlay" onClick={() => { setRejecting(false); setRejectReason(""); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Application</h3>
              <button onClick={() => { setRejecting(false); setRejectReason(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)" }}>✕</button>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
              Please provide a reason for rejecting <strong>{selected.full_name}</strong>'s application. This will be sent to the applicant.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rejection reason</label>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. ID photo is unclear, please resubmit with a clearer photo..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>
            {/* Quick reasons */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {["ID photo is unclear", "ID appears invalid", "Selfie doesn't match ID", "Incomplete profile"].map(r => (
                <button key={r} onClick={() => setRejectReason(r)} style={{
                  padding: "5px 10px", border: "1px solid var(--border-2)",
                  borderRadius: "var(--radius-sm)", background: rejectReason === r ? "var(--bg-3)" : "none",
                  fontSize: 12, cursor: "pointer", color: "var(--text-mid)"
                }}>{r}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => reject(selected)} disabled={processing || !rejectReason}>
                {processing ? "Rejecting..." : "Confirm rejection"}
              </button>
              <button className="btn btn-secondary" onClick={() => { setRejecting(false); setRejectReason(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
