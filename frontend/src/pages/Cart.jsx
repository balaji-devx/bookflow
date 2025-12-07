import React from "react"; 
import { useNavigate } from "react-router-dom"; 
import "../pages/css/App.css"; 
import NavBar from "../components/Navbar";
import Footer from "../components/footer";
import { useCart } from '../context/CartContext'; 

// --- Dedicated Component for Cart Item ---
const CartItem = ({ item, formatINR, changeQty, removeItem }) => (
    <div className="product-card">
        <img
            src={item.img}
            alt={item.title}
            className="product-image"
        />

        <div className="product-details">
            <h3 className="product-title">{item.title}</h3>
            <p className="book-author">{item.author}</p>

            <div className="price-and-qty-controls">
                <strong className="product-price">{formatINR(item.price * item.qty)}</strong>
                
                <div className="quantity-controls">
                    <button
                        onClick={() => changeQty(item.id, -1)}
                        className="qty-btn decrease-qty"
                        aria-label={`Decrease quantity of ${item.title}`}
                        disabled={item.qty === 1}
                    >
                        −
                    </button>
                    <span className="current-qty">{item.qty}</span>
                    <button
                        onClick={() => changeQty(item.id, +1)}
                        className="qty-btn increase-qty"
                        aria-label={`Increase quantity of ${item.title}`}
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="product-actions">
                <button
                    onClick={() => removeItem(item.id)}
                    className="action-btn remove-btn"
                >
                    Remove
                </button>

                <button
                    onClick={() => alert(`Buy 1 copy of "${item.title}" for ${formatINR(item.price)} (Demo)`)}
                    className="action-btn buy-single-btn"
                >
                    Buy Now
                </button>
            </div>
        </div>
    </div>
);
// ----------------------------------------

function Cart() {
    const navigate = useNavigate(); 
    
    // 🎯 GET state and handlers from context
    const { cartItems, changeQty, removeItem } = useCart();
    
    const formatINR = (value) =>
      new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
        value
      );

    // Calculations based on context state
    const totalBooks = cartItems.reduce((s, it) => s + it.qty, 0);
    const totalPrice = cartItems.reduce((s, it) => s + it.qty * it.price, 0);
    const shipping = totalBooks > 0 ? 49 : 0; 
    const grandTotal = totalPrice + shipping;

    // --- BUTTON HANDLERS ---
    const checkEmptyCart = () => {
        if (totalBooks === 0) {
            alert("Your cart is empty! Add items before proceeding.");
            return true;
        }
        return false;
    }

    const handleProceedToCheckout = () => {
        if (checkEmptyCart()) return;
        // 🎯 Redirects to the separate Checkout (Buy) page
        navigate('/checkout'); 
    };

    const handleBorrow = () => {
        if (checkEmptyCart()) return;
        // 🎯 FIX: Redirects to the separate Borrow page
        navigate('/borrow'); 
    };
    
    // --- JSX CONTENT ---
    const CartContent = (
      <>
        <div className="product-grid">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              formatINR={formatINR}
              changeQty={changeQty}
              removeItem={removeItem}
            />
          ))}
        </div>

        <aside className="summary-panel">
          <h2 className="summary-title">Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal ({totalBooks} items)</span>
            <strong>{formatINR(totalPrice)}</strong>
          </div>
          
          <div className="summary-row">
            <span>Shipping</span>
            <strong>{shipping === 0 ? "FREE" : formatINR(shipping)}</strong>
          </div>

          <div className="summary-row total-row">
            <h3>Grand Total</h3>
            <strong>{formatINR(grandTotal)}</strong>
          </div>

          <div className="checkout-actions">
            <button
              onClick={handleProceedToCheckout}
              className="checkout-btn buy-checkout-btn"
            >
              Proceed to Checkout ({formatINR(grandTotal)})
            </button>

            <button
              onClick={handleBorrow} // 👈 This now navigates to /borrow
              className="checkout-btn borrow-checkout-btn"
            >
              Proceed to Borrow
            </button>
          </div>

          <small className="borrow-note">
            Buying is the main flow. Borrowing is available as a side option — you will see borrow rules at checkout.
          </small>
        </aside>
      </>
    );

    const EmptyCart = (
      <div className="empty-cart-state">
        <h2>Your Cart is Empty! </h2>
        <p>Time to add some high quality reads to your collection!</p>
        <a href="/shop" className="continue-shopping-link">Continue Shopping</a>
      </div>
    );


    return (
      <>
        <NavBar />
        <div className="cart-page-wrapper">
          <h1 className="cart-title">Cart  Review & Finalize</h1>
          
          <div className="cart-main-grid">
            {cartItems.length > 0 ? CartContent : EmptyCart}
          </div>

        </div>
        <Footer />
      </>
    );
}

export default Cart;