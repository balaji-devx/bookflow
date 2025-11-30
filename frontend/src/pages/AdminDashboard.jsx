import  { useEffect, useState, useCallback } from "react";
import NavBar from "../components/Navbar.jsx";
import "../pages/css/App.css"; // Global CSS file (where tab styles should go)
import { API_BASE_URL } from '../utils/apiConfig';

// --- Helper function to display placeholder info when user data is missing ---
const getDisplayInfo = (user) => {
    // Uses populated user data from the backend
    if (user && user.name && user.email) {
        return `${user.name} (${user.email})`;
    }
    // Fallback if the user object couldn't be populated by Mongoose
    return user ? `User ID: ${user._id.slice(-6)}` : 'N/A';
};

// --- Dedicated Component for User Management Table (UNCHANGED) ---
const UserTable = ({ users }) => (
    <div className="admin-table-section">
        <h2>Registered Users ({users.length})</h2>
        <div className="users-table-wrapper">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>ID (Last 6)</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: "center" }}>No users found.</td></tr>
                    ) : (
                        users.map((u) => (
                            <tr key={u._id}>
                                <td>{u._id.slice(-6)}</td>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- Dedicated Component for Order Fulfillment Table ---
const OrderTable = ({ orders, formatINR, onUpdate }) => (
    <div className="admin-table-section">
        <h2>📦 Pending Fulfillment ({orders.length})</h2>
        <div className="users-table-wrapper">
            <table className="users-table orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: "center" }}>No orders currently processing.</td></tr>
                    ) : (
                        orders.map(order => (
                            <tr key={order._id}>
                                <td>{order._id.slice(-6)}</td>
                                <td>{getDisplayInfo(order.user)}</td>
                                <td>{order.orderItems.length} item(s)</td>
                                <td>{formatINR(order.totalPrice)}</td>
                                <td><span className={`status-badge status-${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></td>
                                <td>
                                    <button 
                                        className="btn btn-action" 
                                        onClick={() => onUpdate(order._id, 'ship')} 
                                        disabled={order.orderStatus === 'Shipped'}
                                    >
                                        {order.orderStatus === 'Shipped' ? 'In Transit' : 'Mark Shipped'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- Dedicated Component for Borrow Management Table ---
// --- Dedicated Component for Borrow Management Table ---
const BorrowTable = ({ borrows, formatINR, onUpdate }) => (
    <div className="admin-table-section">
        <h2>📚 Active Borrow Requests ({borrows.length})</h2>
        <div className="users-table-wrapper">
            <table className="users-table borrows-table">
                <thead>
                    <tr>
                        <th>Book Title</th>
                        <th>Customer</th>
                        <th>Due Date</th>
                        <th>Deposit</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {borrows.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: "center" }}>No active borrows or overdue books.</td></tr>
                    ) : (
                        borrows.map(borrow => {
                            
                            // 🎯 NEW: Determine the next required action
                            let actionText = '';
                            let actionType = ''; // 'borrowed' or 'returned'
                            let isDisabled = false;

                            if (borrow.borrowStatus === 'Reserved') {
                                actionText = 'Confirm Pickup';
                                actionType = 'borrowed'; // First required action
                                isDisabled = false;
                            } else if (borrow.borrowStatus === 'Borrowed' || borrow.borrowStatus === 'Overdue') {
                                actionText = 'Mark Returned';
                                actionType = 'returned'; // Second required action
                                isDisabled = false;
                            } else {
                                actionText = borrow.borrowStatus; // Status like 'Returned'
                                isDisabled = true;
                            }

                            return (
                                <tr key={borrow._id}>
                                    <td>{borrow.book.title}</td>
                                    <td>{getDisplayInfo(borrow.user)}</td>
                                    <td>{new Date(borrow.dueDate).toLocaleDateString()}</td>
                                    <td>{formatINR(borrow.depositAmount)}</td>
                                    <td><span className={`status-badge status-${borrow.borrowStatus.toLowerCase()}`}>{borrow.borrowStatus}</span></td>
                                    <td>
                                        <button 
                                            className={`btn btn-action ${actionType === 'returned' ? 'secondary' : 'primary'}`}
                                            onClick={() => onUpdate(borrow._id, actionType)} // Calls handleUpdateBorrow with 'borrowed'
                                            disabled={isDisabled}
                                        >
                                            {actionText}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

function AdminDashboard() {
    const [summary, setSummary] = useState(null);
    const [users, setUsers] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [activeBorrows, setActiveBorrows] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusToast, setStatusToast] = useState(null); 
    const [activeTab, setActiveTab] = useState('summary'); 

    const token = localStorage.getItem("token");
    const formatINR = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

    // --- Data Fetching Effect (Extracted to useCallback for easy refreshing) ---
    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        try {
    // 🎯 1. Fetch all required data concurrently using the global API_BASE_URL
    const [summaryRes, usersRes, ordersRes, borrowsRes] = await Promise.all([
        // 1. Admin Summary
        fetch(`${API_BASE_URL}/admin/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        
        // 2. Admin Users
        fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        
        // 3. Pending Orders (Transaction Admin Route)
        fetch(`${API_BASE_URL}/transactions/admin/orders/pending`, { headers: { Authorization: `Bearer ${token}` } }),
        
        // 4. Active Borrows (Transaction Admin Route)
        fetch(`${API_BASE_URL}/transactions/admin/borrows/active`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    // ... (rest of the logic: handling 401/403, processing JSON responses, etc., remains the same) ...

            if (summaryRes.status === 401 || summaryRes.status === 403) {
                setError("Session expired or Admin access revoked. Redirecting...");
                setTimeout(() => { window.location.href = "/login"; }, 1500);
                return;
            }
            
            // 3. Process Responses
            const summaryData = await summaryRes.json().catch(() => ({}));
            const usersData = await usersRes.json().catch(() => ({ users: [] }));
            const ordersData = await ordersRes.json().catch(() => ([]));
            const borrowsData = await borrowsRes.json().catch(() => ([]));

            setSummary(summaryData);
            setUsers(usersData.users || []);
            setPendingOrders(ordersData); 
            setActiveBorrows(borrowsData); 
            
        } catch (err) {
            console.error("Admin dashboard fetch error:", err);
            setError("Could not load admin data. Check backend/server.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Initial Fetch on Mount
    useEffect(() => {
        if (token) {
            fetchData();
        } else {
            window.location.href = "/login";
        }
    }, [token, fetchData]);


    // --- 🎯 HANDLER FOR UPDATING ORDER STATUS (MARK SHIPPED) ---
    const handleUpdateOrder = async (orderId, actionType) => {
        setStatusToast('Updating order status...');
       const endpoint = `${API_BASE_URL}/transactions/admin/orders/${orderId}/${actionType}`;

        try {
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update order status.');
            }

            setStatusToast(`Order ${orderId.slice(-6)} marked as SHIPPED!`);
            fetchData(); 
            setActiveTab('orders'); 

        } catch (err) {
            setStatusToast(`Error: ${err.message}`);
        }
    };

    // --- 🎯 HANDLER FOR UPDATING BORROW STATUS (CONFIRM RETURNED) ---
    const handleUpdateBorrow = async (borrowId, actionType) => {
        setStatusToast('Updating borrow status...');
        const endpoint = `${API_BASE_URL}/transactions/admin/borrows/${borrowId}/status`;

        try {
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: actionType }), // actionType is 'returned' or 'borrowed'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update borrow status.');
            }

            setStatusToast(`Borrow ${borrowId.slice(-6)} marked as ${actionType.toUpperCase()}. Dashboard refreshing...`);
            fetchData(); 
            setActiveTab('borrows'); 

        } catch (err) {
            setStatusToast(`Error: ${err.message}`);
        }
    };

    // Logic to render content based on tab (UNCHANGED)
    const renderContent = () => {
        if (loading) return <div className="info-box">Loading dashboard...</div>;
        if (error) return <div className="error-box">{error}</div>;

        switch (activeTab) {
            case 'users':
                return <UserTable users={users} />;
            case 'orders':
                // Pass the order update handler
                return <OrderTable orders={pendingOrders} formatINR={formatINR} onUpdate={handleUpdateOrder} />;
            case 'borrows':
                // Pass the borrow update handler
                return <BorrowTable borrows={activeBorrows} formatINR={formatINR} onUpdate={handleUpdateBorrow} />;
            case 'summary':
            default:
                return (
                    <>
                        {/* Summary Grid */}
                        <div className="admin-stats-grid">
                            <div className="stat-card"><h3>Total Users</h3><p>{summary?.totalUsers || 0}</p></div>
                            <div className="stat-card"><h3>Admins</h3><p>{summary?.admins || 0}</p></div>
                            <div className="stat-card"><h3>Pending Orders</h3><p>{pendingOrders.length}</p></div>
                            <div className="stat-card"><h3>Active Borrows</h3><p>{activeBorrows.length}</p></div>
                            <div className="stat-card"><h3>Total Books</h3><p>{summary?.totalBooks || 0}</p></div>
                        </div>
                        
                        <div className="admin-quick-view">
                            <h2 className="section-title">Fulfillment Snapshot</h2>
                            <p>Orders in Fulfillment: **{pendingOrders.length}** | Active Loans: **{activeBorrows.length}**</p>
                        </div>
                    </>
                );
        }
    };

    if (!token) return null; // Prevent rendering if not authenticated

    return (
        <>
            <NavBar />

            <div className="admin-container">
                <div className="admin-header">
                    <h1>📊 Admin Dashboard</h1>
                    <p>Monitor and manage all operations for Mosster's BookFlow.</p>
                </div>

                {/* 🎯 TAB NAVIGATION */}
                <div className="tab-container">
                    <button className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
                    <button className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders ({pendingOrders.length})</button>
                    <button className={`tab-button ${activeTab === 'borrows' ? 'active' : ''}`} onClick={() => setActiveTab('borrows')}>Borrows ({activeBorrows.length})</button>
                    <button className={`tab-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users ({users.length})</button>
                </div>
                
                {statusToast && <div className="toast" style={{marginBottom: '15px'}}>{statusToast}</div>}

                {/* 🎯 CONTENT RENDERED BASED ON ACTIVE TAB */}
                <div className="admin-content">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default AdminDashboard;