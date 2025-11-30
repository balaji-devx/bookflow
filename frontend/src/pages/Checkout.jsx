import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useCart } from '../context/CartContext';
import NavBar from "../components/Navbar";
import Footer from "../components/footer";
// Import your CSS file for the checkout layout
import "../pages/css/App.css"; 
import { API_BASE_URL } from '../utils/apiConfig';

function Checkout() {
    const navigate = useNavigate(); 
    
    // 1. Get Cart State and Handlers
    const { cartItems, removeItem, changeQty } = useCart();
    
    // 🎯 NEW: State to manage API interaction feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. Local State for Form Data
    const [formData, setFormData] = useState({
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        address: '',
        city: '',
        pincode: '',
    });

    // 3. Helper Functions
    const formatINR = (value) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

    // Calculations (Copied from Cart)
    const totalBooks = cartItems.reduce((s, it) => s + it.qty, 0);
    const totalPrice = cartItems.reduce((s, it) => s + it.qty * it.price, 0);
    const shipping = totalBooks > 0 ? 49 : 0; 
    const grandTotal = totalPrice + shipping;

    // 4. Form Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = formData.name && formData.address && formData.city && formData.pincode;


    // --- 🎯 MODIFIED: handleCheckout function with API logic ---
    const handleCheckout = (type) => async (e) => { // Make function async
        e.preventDefault();
        setError(null);
        
        if (totalBooks === 0) {
            alert("Your cart is empty. Please add books before checkout.");
            return;
        }

        if (!isFormValid) {
             alert("Please fill in all shipping details.");
             return;
        }
        
        // --- BORROW FLOW REDIRECT (Unchanged) ---
        if (type === 'borrow') {
            navigate('/borrow'); // Redirect to dedicated borrow page
            return;
        }

        // --- BUY FLOW (API INTEGRATION) ---
        
        // 1. Structure the data for the backend
        const orderPayload = {
            orderItems: cartItems.map(item => ({
                bookId: item.id,
                title: item.title, // Send title for server-side error messages
                quantity: item.qty
            })),
            shippingAddress: formData, // Send the full form data
            totalPrice: grandTotal, // Send the grand total
        };
        
        setLoading(true);

        try {
            // Retrieve JWT token for authentication
            const token = localStorage.getItem('token');
            if (!token) throw new Error("User not authenticated. Please log in again.");

            // Assuming you have imported the global constant: import { API_BASE_URL } from '../utils/apiConfig';

const response = await fetch(`${API_BASE_URL}/transactions/order`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(orderPayload),
});

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Order failed with status: ${response.status}`);
            }

            // 2. Success: Notify and Redirect
            alert(`✅ Order Placed! ID: ${data.orderId}. Status: ${data.status}.`);
            
            // In a real app, you would dispatch a 'clearCart' action here
            // navigate('/profile?tab=orders'); // Redirect to user's order history/profile
            
        } catch (err) {
            console.error("Checkout API Error:", err);
            setError(err.message || 'Failed to connect to the server or price mismatch occurred.');
        } finally {
            setLoading(false);
        }
    };


    if (totalBooks === 0) {
        return (
            <>
                <NavBar />
                <div className="checkout-empty-state">
                    <h1>Checkout Failed</h1>
                    <p>Your cart is empty. Please continue shopping!</p>
                    <a href="/shop">Go to Shop</a>
                </div>
                <Footer />
            </>
        );
    }


    // 5. Render JSX
    return (
        <>
            <NavBar />
            <div className="checkout-page-wrapper">
                <h1 className="checkout-title">Finalize Your Order</h1>
                <p className="checkout-subtitle">Choose your option: **Buy** for ownership or **Borrow** to read and return.</p>
                
                <div className="checkout-main-grid">
                    
                    {/* --- Left Column: Shipping & Details --- */}
                    <div className="shipping-details-container">
                        <h2>1. Shipping Information</h2>
                        <form className="shipping-form" onSubmit={(e) => e.preventDefault()}>
                            
                            <label>Full Name:</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                            
                            <label>Email:</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required readOnly />
                            
                            <label>Address:</label>
                            <textarea name="address" value={formData.address} onChange={handleInputChange} required rows="3"></textarea>
                            
                            <div className="form-row">
                                <label>City:</label>
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                                
                                <label>Pincode:</label>
                                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                            </div>
                        </form>

                        <h2>2. Items ({totalBooks})</h2>
                        <div className="item-list-small">
                            {cartItems.map(item => (
                                <div key={item.id} className="checkout-item-row">
                                    <span>{item.title} ({item.qty}x)</span>
                                    <strong>{formatINR(item.price * item.qty)}</strong>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- Right Column: Order Summary & Actions --- */}
                    <div className="order-summary-panel">
                        <h2>3. Payment Method & Options</h2>
                        
                        <div className="summary-section">
                            <div className="summary-row">
                                <span>Subtotal ({totalBooks} items)</span>
                                <strong>{formatINR(totalPrice)}</strong>
                            </div>
                            
                            <div className="summary-row">
                                <span>Shipping Charge</span>
                                <strong>{shipping === 0 ? "FREE" : formatINR(shipping)}</strong>
                            </div>

                            <div className="summary-row total-row">
                                <h3>Grand Total</h3>
                                <strong className="grand-total-amount">{formatINR(grandTotal)}</strong>
                            </div>
                        </div>
                        
                        {/* Show Error/Loading Feedback */}
                        {error && <div className="error-box" style={{marginBottom: '10px'}}>Error: {error}</div>}

                        {/* --- BUY Option --- */}
                        <button
                            onClick={handleCheckout('buy')}
                            className="checkout-btn buy-final-btn"
                            disabled={!isFormValid || loading} // Disable if form isn't minimally filled or loading
                        >
                            {loading ? "Processing Payment..." : `Confirm & Pay ${formatINR(grandTotal)} (Buy)`}
                        </button>
                        
                        <hr className="divider" />
                        
                        {/* --- BORROW Option --- */}
                        <div className="borrow-info">
                            <p>Prefer to read and return?</p>
                            <small>Borrowing requires a refundable security deposit (calculated at next step) and adherence to borrowing policies.</small>
                        </div>
                        <button
                            onClick={handleCheckout('borrow')} // Navigates to /borrow
                            className="checkout-btn borrow-final-btn"
                            disabled={!isFormValid || loading}
                        >
                            Proceed to Borrow Terms
                        </button>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Checkout;