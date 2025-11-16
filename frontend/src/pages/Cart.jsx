import React, { useState } from "react";
import "../pages/css/App.css"; // Assuming this handles the styling
import NavBar from "../components/Navbar";
import Footer from "../components/footer";

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
      <p className="product-author">{item.author}</p>

      <div className="price-and-qty-controls">
        <strong className="product-price">{formatINR(item.price * item.qty)}</strong>
        
        <div className="quantity-controls">
          <button
            onClick={() => changeQty(item.id, -1)}
            className="qty-btn decrease-qty"
            aria-label={`Decrease quantity of ${item.title}`}
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
  // === MODIFICATION: Initial state is now an empty array [] ===
  const [cartItems, setCartItems] = useState([]); 
  // =============================================================

  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
      value
    );

  const changeQty = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it))
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((it) => it.id !== id));
  };

  const totalBooks = cartItems.reduce((s, it) => s + it.qty, 0);
  const totalPrice = cartItems.reduce((s, it) => s + it.qty * it.price, 0);
  const shipping = totalBooks > 0 ? 49 : 0; // Add simple shipping logic
  const grandTotal = totalPrice + shipping;

  const handleBuy = () => {
    alert(`Proceeding to buy ${totalBooks} book(s) for ${formatINR(grandTotal)}. (Demo)`);
  };

  const handleBorrow = () => {
    alert("Proceeding to Borrow flow. (Demo)");
  };
  
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
            onClick={handleBuy}
            className="checkout-btn buy-checkout-btn"
          >
            Proceed to Buy {formatINR(grandTotal)}
          </button>

          <button
            onClick={handleBorrow}
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
      <h2>Your Cart is Empty! 🛒</h2>
      <p>Time to add some high-quality reads to your collection, Mosster.</p>
      {/* Placeholder for link to shopping/home page */}
      <a href="/shop" className="continue-shopping-link">Continue Shopping</a>
    </div>
  );


  return (
    <>
      <NavBar />
      <div className="cart-page-wrapper">
        <h1 className="cart-title">Cart — Buy or Borrow</h1>
        
        <div className="cart-main-grid">
          {cartItems.length > 0 ? CartContent : EmptyCart}
        </div>

      </div>
      <Footer />
    </>
  );
}

export default Cart;