import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar";
import Footer from "../components/footer";
import "../pages/css/App.css"; // keep using your global file

// small inline SVG icons (no external lib required)
const Icon = {
  Cart: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45C8.89 16.37 9.19 17 9.75 17h8.5v-2h-7.9l.6-1.1L19 6H7z" fill="currentColor" />
    </svg>
  ),
  Shop: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M4 6h16v2H4zM6 10h12v8H6z" fill="currentColor" />
    </svg>
  ),
  Lend: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3L1 9l11 6 9-4.91V17h2V9z" fill="currentColor" />
    </svg>
  ),
  Settings: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M19.14 12.94a7 7 0 0 0 0-1.88l2.03-1.58-2-3.46-2.39.96a7.1 7.1 0 0 0-1.6-.93l-.36-2.54H9.18l-.36 2.54c-.56.2-1.1.47-1.6.93L4.83 6l-2 3.46L4.86 11c-.04.31-.06.62-.06.94s.02.63.06.94L2.83 14.8 4.83 18l2.39-.96c.5.46 1.04.83 1.6.93l.36 2.54h4.64l.36-2.54c.56-.2 1.1-.47 1.6-.93l2.39.96 2-3.46-2.03-1.58zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" fill="currentColor" />
    </svg>
  ),
};

function Avatar({ name, size = 80 }) {
  const initials = (name || "Guest User")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="avatar"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size / 2.8) }}
      title={name}
    >
      {initials}
    </div>
  );
}

const ProfileActionCard = ({ title, icon, description, onClick, isPrimary = false }) => {
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      className={`profile-action-card ${isPrimary ? "primary-action" : "secondary-action"}`}
      onClick={onClick}
      onKeyDown={handleKey}
      aria-label={title}
      type="button"
    >
      <div className={`action-top ${isPrimary ? "action-top-primary" : "action-top-secondary"}`}>
        <div className="action-icon" aria-hidden="true">{icon}</div>
        <div className="action-details">
          <h3 className="action-title">{title}</h3>
          <p className="action-description">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("Guest User");
  const [email, setEmail] = useState("guest@example.com");
  const [userImage, setUserImage] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("userName");
      const storedEmail = localStorage.getItem("userEmail");
      const storedImg = localStorage.getItem("userImage"); // optional image URL/base64
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedImg) setUserImage(storedImg);
    } catch (e) {
      console.warn("localStorage unavailable", e);
    }
  }, []);

  const showToast = useCallback((text) => {
    setToast(text);
    setTimeout(() => setToast(null), 1800);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      // keep userImage if you want; remove if you prefer:
      // localStorage.removeItem("userImage");
    } catch (e) {
      console.warn("localStorage remove failed", e);
    }
    setName("Guest User");
    setEmail("guest@example.com");
    setUserImage(null);
    showToast("Logged out — redirecting");
    // navigate to login after small delay so toast is visible
    setTimeout(() => navigate("/login"), 600);
  };

  const actions = [
    {
      title: "Your Cart",
      icon: Icon.Cart,
      description: "View, edit and checkout your books.",
      onClick: () => navigate("/cart"),
      isPrimary: true,
    },
    {
      title: "Shop Books",
      icon: Icon.Shop,
      description: "Explore the full collection.",
      onClick: () => navigate("/shop"),
    },
    {
      title: "Lend Books",
      icon: Icon.Lend,
      description: "Manage lends & borrow requests.",
      onClick: () => navigate("/lend"),
    },
    {
      title: "Account Settings",
      icon: Icon.Settings,
      description: "Update profile, payment and addresses.",
      onClick: () => navigate("/settings"),
    },
  ];

  const recentActivity = [
    { type: "Last Order", desc: "Atomic Habits", status: "Delivered", statusClass: "status-delivered" },
    { type: "Pending Borrow", desc: "Dune", status: "Waiting", statusClass: "status-waiting" },
    { type: "Settings Change", desc: "Updated Email Address", status: "Completed", statusClass: "status-completed" },
  ];

  return (
    <>
      <NavBar />
      <main className="profile-page">
        <header className="profile-header">
          <div className="header-left">
            <h1 className="profile-title">Hello, {name.split(" ")[0] || "Guest"} 👋</h1>
            <p className="profile-sub">Welcome back — here's your dashboard.</p>
          </div>
        </header>

        <section className="profile-card" aria-labelledby="account-info">
          <div className="profile-card-left">
            {userImage ? (
              <img className="profile-img" src={userImage} alt={`${name} profile`} />
            ) : (
              <Avatar name={name} />
            )}
          </div>

          <div className="profile-card-right">
            <h2 id="account-info" className="user-name">{name}</h2>
            <p className="user-email">{email}</p>
            <div className="profile-actions-row">
              <button
                className="btn logout"
                onClick={handleLogout}
                aria-label="Logout and go to login"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className="actions-section" aria-labelledby="actions-title">
          <h2 id="actions-title" className="section-title">Your Account Actions</h2>
          <div className="action-grid">
            {actions.map((a) => (
              <ProfileActionCard key={a.title} {...a} />
            ))}
          </div>
        </section>

        <section className="activity-section" aria-labelledby="activity-title">
          <h2 id="activity-title" className="section-title">Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-header">
              <span>Activity</span>
              <span>Status</span>
            </div>

            {recentActivity.map((act, i) => (
              <div className="activity-item" key={i}>
                <div>
                  <div className="activity-type">{act.type}</div>
                  <div className="activity-desc">{act.desc}</div>
                </div>
                <div className={`activity-status ${act.statusClass}`} aria-live="polite">
                  {act.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* toast */}
        {toast && <div className="toast" role="status">{toast}</div>}
      </main>
      <Footer />
    </>
  );
}
