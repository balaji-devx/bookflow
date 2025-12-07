import { useEffect, useState, useCallback } from "react";
import NavBar from "../components/Navbar.jsx";
import "../pages/css/App.css"; 
import { API_BASE_URL } from '../utils/apiConfig';

// --- Helper function to display placeholder info when user data is missing ---
const getDisplayInfo = (user) => {
    if (user && user.name && user.email) {
        return `${user.name} (${user.email})`;
    }
    return user ? `User ID: ${user._id.slice(-6)}` : 'N/A';
};

// --- Dedicated Component for User Management Table (UPDATED) ---
const UserTable = ({ users, onModify, onDelete }) => (
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
                        <th style={{ width: '120px' }}>Actions</th> {/* NEW COLUMN */}
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: "center" }}>No users found.</td></tr>
                    ) : (
                        users.map((u) => (
                            <tr key={u._id}>
                                <td>{u._id.slice(-6)}</td>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                                <td>
                                    {/* 🎯 NEW: Modify (Yellow) and Delete (Red) Buttons */}
                                    <button 
                                        className="btn btn-action btn-yellow" 
                                        onClick={() => onModify(u._id)} 
                                        aria-label="Edit User"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn btn-action btn-red" 
                                        onClick={() => onDelete(u._id, u.name)} 
                                        disabled={u.role === 'admin'} // Cannot delete self or other admins
                                        aria-label="Delete User"
                                    >
                                        Delete
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

// --- Dedicated Component for Order Fulfillment Table (UNCHANGED) ---
const OrderTable = ({ orders, formatINR, onUpdate }) => (
     <div className="admin-table-section">

        <h2> Pending Fulfillment ({orders.length})</h2>

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

// --- Dedicated Component for Borrow Management Table (UNCHANGED) ---
const BorrowTable = ({ borrows, formatINR, onUpdate }) => (
     <div className="admin-table-section">

        <h2> Active Borrow Requests ({borrows.length})</h2>

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

// --- 🎯 NEW: Component for Lending Submissions Review ---
const LendSubmissionsTable = ({ submissions, onApprove, onReject }) => (
    <div className="admin-table-section">
        <h2> Pending Lend Submissions ({submissions.length})</h2>
        <div className="users-table-wrapper">
            <table className="users-table submissions-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>ISBN</th>
                        <th>Condition</th>
                        <th>Copies</th>
                        <th>Lender</th>
                        <th>Submitted</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.length === 0 ? (
                        <tr><td colSpan="7" style={{ textAlign: "center" }}>No pending submissions for review.</td></tr>
                    ) : (
                        submissions.map(sub => (
                            <tr key={sub._id}>
                                <td>{sub.title}</td>
                                <td>{sub.isbn}</td>
                                <td>{sub.condition}</td>
                                <td>{sub.copies}</td>
                                <td>{getDisplayInfo(sub.lender)}</td> {/* Assuming lender is populated */}
                                <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {/* Approve (Green) / Reject (Red) Buttons */}
                                    {sub.status === 'Pending Review' ? (
                                        <>
                                            <button 
                                                className="btn btn-action btn-green" 
                                                onClick={() => onApprove(sub._id)}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                className="btn btn-action btn-red" 
                                                onClick={() => onReject(sub._id)}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span className={`status-badge status-${sub.status.toLowerCase().replace(' ', '-')}`}>
                                            {sub.status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);
// -----------------------------------------------------

function AdminDashboard() {
    const [summary, setSummary] = useState(null);
    const [users, setUsers] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [activeBorrows, setActiveBorrows] = useState([]);
    const [lendSubmissions, setLendSubmissions] = useState([]); // 🎯 NEW STATE
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusToast, setStatusToast] = useState(null); 
    const [activeTab, setActiveTab] = useState('summary'); 

    const token = localStorage.getItem("token");
    const formatINR = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

    // --- Data Fetching Effect (UPDATED to include lend submissions) ---
    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        try {
            // 🎯 1. Fetch all required data concurrently
            const [summaryRes, usersRes, ordersRes, borrowsRes, submissionsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/summary`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/transactions/admin/orders/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/transactions/admin/borrows/active`, { headers: { Authorization: `Bearer ${token}` } }),
                // 🎯 NEW FETCH: Pending Lend Submissions
                fetch(`${API_BASE_URL}/admin/lend-submissions/pending`, { headers: { Authorization: `Bearer ${token}` } }), 
            ]);

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
            const submissionsData = submissionsRes.ok ? await submissionsRes.json().catch(() => ([])) : []; // 🎯 NEW

            setSummary(summaryData);
            setUsers(usersData.users || []);
            setPendingOrders(ordersData); 
            setActiveBorrows(borrowsData); 
            setLendSubmissions(submissionsData); // 🎯 NEW STATE UPDATE
            
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


    // --- CRUD Handlers for Users ---
    const handleModifyUser = (userId) => {
        setStatusToast(`Modifying user ID: ${userId.slice(-6)} (Functionality coming soon!)`);
        // FUTURE STEP: Implement a modal form for editing user data
    };
    
    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to permanently delete user ${userName}?`)) {
            return;
        }
        setStatusToast('Deleting user...');
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/user/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user.');
            }
            
            setStatusToast(`User ${userName} deleted successfully.`);
            fetchData(); // Refresh data
            
        } catch (err) {
            setStatusToast(`Error: ${err.message}`);
        }
    };
    
    // --- Handlers for Lend Submissions ---
    const handleLendAction = async (submissionId, action) => {
        setStatusToast(`${action} submission...`);
        
        // 🚨 IMPORTANT: You must create this new PATCH route in your backend!
        const endpoint = `${API_BASE_URL}/admin/lend-submissions/${submissionId}/${action}`; 

        try {
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${action} submission.`);
            }

            setStatusToast(`Submission marked as ${action.toUpperCase()}!`);
            fetchData(); // Refresh data
            setActiveTab('submissions'); 

        } catch (err) {
            setStatusToast(`Error: ${err.message}`);
        }
    };

    // Placeholder handlers for existing Order/Borrow updates
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


    // Logic to render content based on tab
    const renderContent = () => {
        if (loading) return <div className="info-box">Loading dashboard...</div>;
        if (error) return <div className="error-box">{error}</div>;

        switch (activeTab) {
            case 'users':
                // Pass the new handlers to UserTable
                return <UserTable users={users} onModify={handleModifyUser} onDelete={handleDeleteUser} />;
            case 'orders':
                return <OrderTable orders={pendingOrders} formatINR={formatINR} onUpdate={handleUpdateOrder} />;
            case 'borrows':
                return <BorrowTable borrows={activeBorrows} formatINR={formatINR} onUpdate={handleUpdateBorrow} />;
            case 'submissions': // 🎯 NEW CASE
                return <LendSubmissionsTable submissions={lendSubmissions} onApprove={(id) => handleLendAction(id, 'approve')} onReject={(id) => handleLendAction(id, 'reject')} />;
            case 'summary':
            default:
                return (
                    <>
                        <div className="admin-stats-grid">
                            <div className="stat-card"><h3>Total Users</h3><p>{summary?.totalUsers || 0}</p></div>
                            <div className="stat-card"><h3>Admins</h3><p>{summary?.admins || 0}</p></div>
                            <div className="stat-card"><h3>Pending Orders</h3><p>{pendingOrders.length}</p></div>
                            <div className="stat-card"><h3>Active Borrows</h3><p>{activeBorrows.length}</p></div>
                            <div className="stat-card"><h3>Pending Submissions</h3><p>{lendSubmissions.length}</p></div> {/* NEW STAT */}
                            <div className="stat-card"><h3>Total Books</h3><p>{summary?.totalBooks || 0}</p></div>
                        </div>
                        
                        <div className="admin-quick-view">
                            <h2 className="section-title">Fulfillment Snapshot</h2>
                            <p>Orders in Fulfillment: {pendingOrders.length} | Active Loans: {activeBorrows.length} | Pending Review: {lendSubmissions.length}</p>
                        </div>
                    </>
                );
        }
    };

    if (!token) return null;

    return (
        <>
            <NavBar />
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <p>Monitor and manage all operations for BookFlow.</p>
                </div>

                {/* 🎯 TAB NAVIGATION (UPDATED) */}
                <div className="tab-container">
                    <button className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
                    <button className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders ({pendingOrders.length})</button>
                    <button className={`tab-button ${activeTab === 'borrows' ? 'active' : ''}`} onClick={() => setActiveTab('borrows')}>Borrows ({activeBorrows.length})</button>
                    <button className={`tab-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users ({users.length})</button>
                    {/* 🎯 NEW TAB */}
                    <button className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>Submissions ({lendSubmissions.length})</button>
                </div>
                
                {statusToast && <div className="toast" style={{marginBottom: '15px'}}>{statusToast}</div>}

                {/* CONTENT RENDERED BASED ON ACTIVE TAB */}
                <div className="admin-content">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default AdminDashboard;