import { AppProvider, useApp } from "./context/AppContext";
import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardPage from "./pages/DashboardPage";
import WorkersPage from "./pages/WorkersPage";
import JobsPage from "./pages/JobsPage";
import UsersPage from "./pages/UsersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

function AppRouter() {
  const { user, unauthorized, page } = useApp();

  if (unauthorized) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F7F7F5" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h2 style={{ marginBottom: 8 }}>Access denied</h2>
        <p style={{ color: "#9B9A97", marginBottom: 24 }}>You don't have admin access to Need.co</p>
        <button className="btn btn-primary" onClick={() => window.location.href = "https://needco-customer.vercel.app"}>Go to customer app</button>
      </div>
    </div>
  );

  if (!user) return <LoginPage />;

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <DashboardPage />;
      case "workers": return <WorkersPage />;
      case "jobs": return <JobsPage />;
      case "users": return <UsersPage />;
      case "analytics": return <AnalyticsPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1 }}>
        <Topbar />
        <div className="page-content">{renderPage()}</div>
      </div>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppRouter /></AppProvider>;
}
