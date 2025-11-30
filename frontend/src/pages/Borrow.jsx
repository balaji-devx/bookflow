import React, { useState } from "react";
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from "react-router-dom"; 
import NavBar from "../components/Navbar";
import Footer from "../components/footer";
import "../pages/css/App.css"; 

function Borrow() {
    const navigate = useNavigate();
    
    // 1. Get Cart State
    const { cartItems } = useCart();
    
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

    // Calculations
    const totalBooks = cartItems.reduce((s, it) => s + it.qty, 0);
    const totalPrice = cartItems.reduce((s, it) => s + it.qty * it.price, 0);
    
    // Safety check for borrowing logic: only proceed if at least one book is present
    const bookToBorrow = cartItems[0] || {};
    
    // Borrowing Logic
    const refundableDeposit = Math.round(totalPrice * 0.5); // 50% of book value as deposit
    const rentalFee = 25 * totalBooks; // Rs 25 non-refundable fee per book
    const initialPayment = refundableDeposit + rentalFee;

    // 4. Form Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = formData.name && formData.address && formData.city && formData.pincode;

    // --- 🎯 MODIFIED: handleFinalBorrow function with API logic ---
    const handleFinalBorrow = async (e) => { 
        e.preventDefault();
        setError(null);
        
        if (totalBooks === 0) {
            alert("Your cart is empty. Please add books before proceeding.");
            return;
        }

        // Enforce single-item borrowing for backend simplicity (as implemented previously)
        if (totalBooks > 1) {
            setError("For now, please only borrow one book at a time.");
            return;
        }

        if (!isFormValid) {
             setError("Please fill in all pickup/return details.");
             return;
        }
        
        // 1. Structure the data for the backend
        const borrowPayload = {
            bookId: bookToBorrow.id, // We only send the ID of the first book
            shippingAddress: formData, 
            depositAmount: refundableDeposit, 
            rentalFee: rentalFee, 
        };
        
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("User not authenticated. Please log in again.");

            const response = await fetch('http://localhost:5000/api/transactions/borrow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(borrowPayload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Borrow request failed with status: ${response.status}`);
            }

            // 2. Success: Notify and Redirect
            alert(`✅ Reservation Confirmed! Deposit: ${formatINR(refundableDeposit)}. Due Date: ${new Date(data.dueDate).toLocaleDateString()}.`);
            // You would clear the cart here!
            navigate('/profile?tab=borrows'); 
            
        } catch (err) {
            console.error("Borrow API Error:", err);
            setError(err.message || 'Failed to connect to the server or reservation failed.');
        } finally {
            setLoading(false);
        }
    };


    if (totalBooks === 0) {
        return (
            <>
                <NavBar />
                <div className="checkout-empty-state">
                    <h1>Borrow Cart Empty</h1>
                    <p>Add books to your cart to start a borrowing request!</p>
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
                <h1 className="checkout-title">Finalize Borrow Request</h1>
                <p className="checkout-subtitle">Confirm your details and pay the **initial refundable deposit** to reserve your books.</p>
                
                <div className="checkout-main-grid">
                    
                    {/* --- Left Column: Pickup/Return Details --- */}
                    <div className="shipping-details-container">
                        <h2>1. Pickup & Return Details</h2>
                        <form className="shipping-form" onSubmit={handleFinalBorrow}>
                            
                            <label>Full Name:</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                            
                            <label>Email:</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required readOnly />
                            
                            <label>Address (For Pickup/Return Instructions):</label>
                            <textarea name="address" value={formData.address} onChange={handleInputChange} required rows="3"></textarea>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City:</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                                </div>
                                
                                <div className="form-group">
                                    <label>Pincode:</label>
                                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                                </div>
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

                    {/* --- Right Column: Borrow Summary & Actions --- */}
                    <div className="order-summary-panel">
                        <h2>3. Borrowing Payment</h2>
                        
                        {error && <div className="error-box" style={{marginBottom: '10px'}}>Error: {error}</div>}
                        
                        <div className="summary-section">
                            <div className="summary-row">
                                <span>Total Book Value</span>
                                <strong>{formatINR(totalPrice)}</strong>
                            </div>
                            
                            <div className="summary-row">
                                <span>Refundable Security Deposit (50%)</span>
                                <strong style={{ color: '#16a34a' }}>{formatINR(refundableDeposit)}</strong>
                            </div>
                            
                            <div className="summary-row">
                                <span>Non-Refundable Rental Fee ({totalBooks} book)</span>
                                <strong>{formatINR(rentalFee)}</strong>
                            </div>

                            <div className="summary-row total-row">
                                <h3>Initial Payment Due</h3>
                                <strong className="grand-total-amount">{formatINR(initialPayment)}</strong>
                            </div>
                        </div>

                        {/* --- BORROW Final Action --- */}
                        <button
                            onClick={handleFinalBorrow}
                            className="checkout-btn borrow-final-btn" 
                            disabled={!isFormValid || loading}
                        >
                            {loading ? "Processing Request..." : `Confirm & Pay Initial Amount (${formatINR(initialPayment)})`}
                        </button>
                        
                        <hr className="divider" />
                        
                        {/* --- Link back to Buy option for comparison --- */}
                        <div className="borrow-info">
                            <p style={{ color: '#d9534f', fontWeight: 'bold' }}>Important Borrow Terms:</p>
                            <small>The Security Deposit is 100% refundable upon safe return of the books. The Rental Fee covers logistics and wear-and-tear.</small>
                        </div>
                        
                        <Link 
                            to="/checkout" 
                            className="checkout-btn buy-final-btn" 
                            style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '15px', background: '#ccc' }}
                        >
                            Switch to Buy Option
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Borrow;