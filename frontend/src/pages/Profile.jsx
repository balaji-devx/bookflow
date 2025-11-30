import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar";
import Footer from "../components/footer";
import "../pages/css/App.css"; // keep using your global file
import { API_BASE_URL } from '../utils/apiConfig';

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

// --- Helper function to map backend status to frontend CSS class ---
const getStatusClass = (status) => {
    switch (status) {
        case 'Delivered':
        case 'Returned':
        case 'Completed':
            return 'status-delivered'; // Green/Success
        case 'Processing':
        case 'Reserved':
            return 'status-processing'; // Blue/Neutral
        case 'Shipped':
            return 'status-shipped'; // Orange/Warning
        case 'Overdue':
        case 'Lost':
            return 'status-alert'; // Red/Danger
        default:
            return 'status-pending';
    }
};

export default function Profile() {
    const navigate = useNavigate();
    const [name, setName] = useState("Guest User");
    const [email, setEmail] = useState("guest@example.com");
    const [userImage, setUserImage] = useState(null);
    const [toast, setToast] = useState(null);
    
    // 🎯 NEW STATE: For storing fetched history
    const [recentActivity, setRecentActivity] = useState([]);
    const [isLoadingActivity, setIsLoadingActivity] = useState(true);

    const token = localStorage.getItem("token");

    // --- User Info Load (remains unchanged) ---
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
    // ------------------------------------------

    // --- 🎯 NEW EFFECT: Fetch Recent Activity ---
    const showToast = useCallback((text) => {
        setToast(text);
        setTimeout(() => setToast(null), 1800);
    }, []);
    
    useEffect(() => {
        if (!token) {
            setIsLoadingActivity(false);
            return;
        }

        const fetchActivity = async () => {
            try {
    // 🎯 FIX: Use the global constant for the API base URL in both requests
    const [ordersRes, borrowsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/transactions/user/orders`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        }),
        fetch(`${API_BASE_URL}/transactions/user/borrows`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        })
    ]);
    
    // ... (rest of the logic: handling 401/403, processing JSON responses, etc.) ...

                // Check for session expiration/unauthorized access
                if (ordersRes.status === 401 || ordersRes.status === 403) {
                     // Clear token and force re-login if session is dead
                     localStorage.removeItem("token");
                     showToast("Session expired. Please log in.");
                     navigate("/login");
                     return;
                }

                const ordersData = ordersRes.ok ? await ordersRes.json() : [];
                const borrowsData = borrowsRes.ok ? await borrowsRes.json() : [];

                // --- MAP AND COMBINE DATA ---
                
                // Map Orders (Purchases)
                const mappedOrders = ordersData.map(order => ({
                    type: `Order (${order.orderStatus})`,
                    desc: order.orderItems[0]?.book?.title || `ID: ${order._id.slice(-6)}`, 
                    status: order.orderStatus,
                    statusClass: getStatusClass(order.orderStatus),
                    date: new Date(order.createdAt),
                }));

                // Map Borrows (Loans)
                const mappedBorrows = borrowsData.map(borrow => ({
                    type: `Borrow (${borrow.borrowStatus})`,
                    desc: borrow.book?.title || `ID: ${borrow._id.slice(-6)}`,
                    status: borrow.borrowStatus,
                    statusClass: getStatusClass(borrow.borrowStatus),
                    date: new Date(borrow.borrowDate),
                }));

                // Combine, sort by date (newest first), and limit to 5
                const combinedActivity = [...mappedOrders, ...mappedBorrows]
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .slice(0, 5); 

                setRecentActivity(combinedActivity);

            } catch (err) {
                console.error("Activity fetch error:", err);
                setRecentActivity([{ type: 'Error', desc: err.message, status: 'Failed', statusClass: 'status-alert' }]);
            } finally {
                setIsLoadingActivity(false);
            }
        };

        if (token) {
            fetchActivity();
        } else {
            setIsLoadingActivity(false); // If no token, stop loading
        }
    }, [token, showToast, navigate]); // Depend on token, showToast, navigate

    const handleLogout = () => { /* ... (remains unchanged) ... */ };
    
    const actions = [
        // ... (your action cards) ...
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
                    {/* ... (Avatar and Profile details) ... */}
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

                {/* --- 🎯 RECENT ACTIVITY SECTION (Updated to use real data) --- */}
                <section className="activity-section" aria-labelledby="activity-title">
                    <h2 id="activity-title" className="section-title">Recent Activity</h2>
                    <div className="activity-list">
                        <div className="activity-header">
                            <span>Activity</span>
                            <span>Status</span>
                        </div>

                        {isLoadingActivity ? (
                            <div className="activity-loading">Loading recent activity...</div>
                        ) : recentActivity.length === 0 ? (
                            <div className="activity-empty">No recent activity found.</div>
                        ) : (
                            recentActivity.map((act, i) => (
                                <div className="activity-item" key={i}>
                                    <div>
                                        <div className="activity-type">{act.type}</div>
                                        <div className="activity-desc">{act.desc}</div>
                                    </div>
                                    <div className={`activity-status ${act.statusClass}`} aria-live="polite">
                                        {act.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* toast */}
                {toast && <div className="toast" role="status">{toast}</div>}
            </main>
            <Footer />
        </>
    );
}