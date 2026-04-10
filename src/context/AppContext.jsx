import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AppContext = createContext(null);

const ADMIN_EMAILS = ["johnmichaellamigo01@gmail.com", "bokii04@gmail.com"];

export function AppProvider({ children }) {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => { setLoading(false); }, 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      if (session?.user) {
        if (!ADMIN_EMAILS.includes(session.user.email)) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }
        setUser(session.user);
      }
      setLoading(false);
    }).catch(() => { clearTimeout(timeout); setLoading(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (!ADMIN_EMAILS.includes(session.user.email)) {
          setUnauthorized(true);
          return;
        }
        setUser(session.user);
        setUnauthorized(false);
      } else {
        setUser(null);
      }
    });

    return () => { clearTimeout(timeout); subscription.unsubscribe(); };
  }, []);

  const navigate = (p) => setPage(p);
  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F7F7F5" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: "#1A1A1A", marginBottom: 8 }}>Need.co</div>
        <div style={{ fontSize: 13, color: "#9B9A97" }}>Loading admin panel...</div>
      </div>
    </div>
  );

  return (
    <AppContext.Provider value={{ page, navigate, user, logout, unauthorized }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
