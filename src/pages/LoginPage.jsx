import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://needco-admin.vercel.app" }
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: "var(--text)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontWeight: 700, fontSize: 20, color: "#fff" }}>N</div>
          <h1 style={{ fontSize: 22, marginBottom: 6 }}>Need.co Admin</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sign in with your admin account</p>
        </div>

        <div className="card">
          <button onClick={handleGoogle} disabled={loading} className="btn btn-primary" style={{ width: "100%", gap: 10, padding: "10px 16px", fontSize: 14 }}>
            <div style={{ width: 18, height: 18, background: "#fff", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#4285F4" }}>G</div>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <div style={{ marginTop: 16, padding: "12px", background: "var(--bg-2)", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
            🔒 Admin access only. Unauthorized users will be redirected.
          </div>
        </div>
      </div>
    </div>
  );
}
