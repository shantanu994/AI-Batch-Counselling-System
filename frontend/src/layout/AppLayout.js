import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaBell,
  FaBookReader,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaLayerGroup,
  FaMoon,
  FaSignOutAlt,
  FaSun,
  FaTachometerAlt,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import NotificationPanel from "../components/NotificationPanel";

function AppLayout({ children, theme, onToggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const getDefaultRoute = (role) => {
    if (role === "student") return "/student";
    if (role === "counsellor") return "/counsellor";
    return "/dashboard";
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt />, roles: ["admin"] },
    { to: "/students", label: "Students", icon: <FaGraduationCap />, roles: ["admin", "counsellor"] },
    { to: "/batches", label: "Batches", icon: <FaLayerGroup />, roles: ["admin"] },
    {
      to: "/counsellor",
      label: "Counsellor",
      icon: <FaChalkboardTeacher />,
      roles: ["admin", "counsellor"],
    },
    { to: "/student", label: "Student", icon: <FaBookReader />, roles: ["admin", "student"] },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(user?.role));

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const { data } = await api.get("/notifications");
        setUnreadCount(data.filter((item) => !item.is_read).length);
      } catch (error) {
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to={getDefaultRoute(user?.role)} className="brand">
          <span>AI</span>
          <div>
            <strong>Batch Counselling</strong>
            <small>College Intelligence Suite</small>
          </div>
        </Link>

        <section className="role-pill" aria-label="Current role">
          <p>Signed in as</p>
          <h4>{user?.role || "guest"}</h4>
        </section>

        <nav>
          {allowedNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <section className="sidebar-footer">
          <h5>System Mode</h5>
          <p>Realtime Counselling Intelligence</p>
        </section>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>AI-Driven Batch Counselling System</h1>
            <p>Welcome {user?.name || "User"} ({user?.role || "guest"})</p>
          </div>

          <div className="topbar-actions">
            <button className="icon-btn" onClick={onToggleTheme} title="Toggle theme">
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>
            <button
              className="icon-btn notification-btn"
              title="Notifications"
              onClick={() => setNotificationOpen((prev) => !prev)}
            >
              <FaBell />
              {unreadCount > 0 ? <span className="notification-badge">{unreadCount}</span> : null}
            </button>
            <button className="icon-btn danger" onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        <NotificationPanel
          open={notificationOpen}
          onClose={() => {
            setNotificationOpen(false);
            setUnreadCount(0);
          }}
        />

        {children}
      </main>
    </div>
  );
}

export default AppLayout;
