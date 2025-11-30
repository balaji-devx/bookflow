import React, { useState, useEffect } from "react"; // 🎯 Added useEffect
import { useLocation } from "react-router-dom"; // Used for reading search queries
import "../pages/css/App.css"; 
import NavBar from "../components/Navbar";
import Footer from "../components/footer";
import { useCart } from '../context/CartContext'; 

// --- Dedicated Component for the Toast Notification (for Add to Cart success) ---
const Notification = ({ message, onClose }) => (
    <div className="notification-toast">
        <div className="notification-content">
            <span className="notification-text">
                {message.text}
            </span>
            <button onClick={onClose} className="notification-close-btn">
                &times;
            </button>
        </div>
    </div>
);
// ----------------------------------------

// --- Dedicated Component for Shop Book Card (UNCHANGED) ---
const BookCard = ({ book, formatINR, handleAddToCart }) => (
    <div className="book-card-item">
        <img
            src={book.img} // Uses the mapped 'img' property
            alt={book.title}
            className="book-image"
        />
        <div className="book-details">
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">{book.author}</p>
            <div className="book-price-row">
                <strong>{formatINR(book.price)}</strong>
                <button
                    onClick={() => handleAddToCart(book)} 
                    className="add-to-cart-btn"
                    aria-label={`Add ${book.title} to cart`}
                >
                    + Add to Cart
                </button>
            </div>
        </div>
    </div>
);
// ----------------------------------------

function Shop() {
    const location = useLocation(); 
    const searchQuery = new URLSearchParams(location.search).get('q'); // Extracts 'q' parameter

    const [notification, setNotification] = useState(null); 
    
    // 🎯 DYNAMIC STATE: This is where we store the data fetched from the backend.
    const [inventory, setInventory] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    const { handleAddToCart: contextHandleAddToCart } = useCart(); 

    const formatINR = (value) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
    
    // --- DATA FETCHING EFFECT (Handles both search and general view) ---
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            
            // 1. Determine API URL: Correctly implements showing ALL books by default
            let apiUrl = "http://localhost:5000/api/books"; // 👈 Default: Fetch all books

            if (searchQuery) {
                // If a search query exists, use the dedicated search endpoint
                apiUrl = `http://localhost:5000/api/books/search?q=${searchQuery}`; 
            }

            try {
                const res = await fetch(apiUrl);
                const data = await res.json();
                
                if (res.ok) {
                    // Map backend data (_id, imgUrl) to frontend structure (id, img)
                    const mappedInventory = data.map(book => ({
                        // IMPORTANT: Use book._id which comes from MongoDB
                        id: book._id, 
                        title: book.title,
                        author: book.author,
                        price: book.price,
                        img: book.imgUrl // Assuming your schema returns 'imgUrl'
                    }));
                    setInventory(mappedInventory);
                } else {
                    setError(data.message || "Failed to fetch inventory or search results.");
                    setInventory([]);
                }
            } catch (err) {
                setError("Network error fetching data. Is the backend running on port 5000?");
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [location.search]); // Re-run effect every time the URL's search query changes
    // ------------------------------------

    // Wrapper function that adds to cart and displays the notification
    const handleAddAndNotify = (book) => {
        contextHandleAddToCart(book);
        setNotification({ text: `Added "${book.title}" to cart!` });

        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    // --- RENDER JSX ---
    return (
        <>
            <NavBar />

            <div className="shop-page-wrapper">
                <h1 className="shop-title">
                    {searchQuery ? `Search Results for: "${searchQuery}"` : "The Book Hub: Explore & Buy"}
                </h1>
                
                {loading && <div className="info-box">Loading book inventory...</div>}
                {error && <div className="error-box">{error}</div>}
                
                {/* Show 'No Results' message only after loading */}
                {!loading && inventory.length === 0 && (
                    <p className="shop-subtitle">
                        {searchQuery 
                            ? `We found no books matching your search for "${searchQuery}".`
                            : "No inventory currently available."
                        }
                    </p>
                )}

                <div className="book-grid">
                    {inventory.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book} 
                            formatINR={formatINR}
                            handleAddToCart={handleAddAndNotify} 
                        />
                    ))}
                </div>
            </div>

            <Footer />
            
            {/* RENDER THE NOTIFICATION outside the main content flow */}
            {notification && (
                <Notification 
                    message={notification} 
                    onClose={() => setNotification(null)}
                />
            )}
        </>
    );
}

export default Shop;