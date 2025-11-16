import React, { useState } from "react";
import "../pages/css/App.css"; 
import NavBar from "../components/Navbar";
import Footer from "../components/footer";

// --- Dedicated Component for Shop Book Card ---
const BookCard = ({ book, formatINR, handleAddToCart }) => (
  <div className="book-card-item">
    <img
      src={book.img}
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
  // Inventory of 30 books (simulated data)
  const [inventory, setInventory] = useState([
    // Group 1: Classics & Personal Growth (9 books from your cart)
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", img: "https://covers.openlibrary.org/b/id/7222246-L.jpg", price: 249 },
    { id: 2, title: "Atomic Habits", author: "James Clear", img: "https://covers.openlibrary.org/b/id/10523317-L.jpg", price: 399 },
    { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee", img: "https://covers.openlibrary.org/b/id/8228691-L.jpg", price: 299 },
    { id: 4, title: "1984", author: "George Orwell", img: "https://covers.openlibrary.org/b/id/7222241-L.jpg", price: 199 },
    { id: 5, title: "The Alchemist", author: "Paulo Coelho", img: "https://covers.openlibrary.org/b/id/8231856-L.jpg", price: 229 },
    { id: 6, title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", img: "https://covers.openlibrary.org/b/id/10556429-L.jpg", price: 499 },
    { id: 7, title: "The Catcher in the Rye", author: "J.D. Salinger", img: "https://covers.openlibrary.org/b/id/8231858-L.jpg", price: 259 },
    { id: 8, title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", img: "https://covers.openlibrary.org/b/id/10523310-L.jpg", price: 349 },
    { id: 9, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", img: "https://covers.openlibrary.org/b/id/8271999-L.jpg", price: 279 },
    
    // Group 2: Tech, Finance & Strategy (Your "Underbike Protocol" vibe)
    { id: 10, title: "The Lean Startup", author: "Eric Ries", img: "https://covers.openlibrary.org/b/id/12836248-L.jpg", price: 450 },
    { id: 11, title: "Zero to One", author: "Peter Thiel", img: "https://covers.openlibrary.org/b/id/10530752-L.jpg", price: 375 },
    { id: 12, title: "The Intelligent Investor", author: "Benjamin Graham", img: "https://covers.openlibrary.org/b/id/11181745-L.jpg", price: 599 },
    { id: 13, title: "Clean Code", author: "Robert C. Martin", img: "https://covers.openlibrary.org/b/id/8446977-L.jpg", price: 650 },
    { id: 14, title: "The Design of Everyday Things", author: "Donald A. Norman", img: "https://covers.openlibrary.org/b/id/7222249-L.jpg", price: 520 },
    { id: 15, title: "Deep Work", author: "Cal Newport", img: "https://covers.openlibrary.org/b/id/10523314-L.jpg", price: 410 },
    { id: 16, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", img: "https://covers.openlibrary.org/b/id/10530756-L.jpg", price: 480 },
    { id: 17, title: "Factfulness", author: "Hans Rosling", img: "https://covers.openlibrary.org/b/id/10530751-L.jpg", price: 360 },
    { id: 18, title: "The Phoenix Project", author: "Gene Kim", img: "https://covers.openlibrary.org/b/id/9091684-L.jpg", price: 490 },

    // Group 3: Fiction & Philosophy (Rounding out the collection)
    { id: 19, title: "A Brief History of Time", author: "Stephen Hawking", img: "https://covers.openlibrary.org/b/id/7222250-L.jpg", price: 380 },
    { id: 20, title: "Lord of the Rings", author: "J.R.R. Tolkien", img: "https://covers.openlibrary.org/b/id/7222251-L.jpg", price: 699 },
    { id: 21, title: "Crime and Punishment", author: "Fyodor Dostoevsky", img: "https://covers.openlibrary.org/b/id/7222252-L.jpg", price: 290 },
    { id: 22, title: "Kafka on the Shore", author: "Haruki Murakami", img: "https://covers.openlibrary.org/b/id/10530757-L.jpg", price: 310 },
    { id: 23, title: "Siddhartha", author: "Hermann Hesse", img: "https://covers.openlibrary.org/b/id/7222253-L.jpg", price: 180 },
    { id: 24, title: "Meditations", author: "Marcus Aurelius", img: "https://covers.openlibrary.org/b/id/7222254-L.jpg", price: 210 },
    { id: 25, title: "The Picture of Dorian Gray", author: "Oscar Wilde", img: "https://covers.openlibrary.org/b/id/7222255-L.jpg", price: 230 },
    { id: 26, title: "Dune", author: "Frank Herbert", img: "https://covers.openlibrary.org/b/id/7222256-L.jpg", price: 470 },
    { id: 27, title: "Educated", author: "Tara Westover", img: "https://covers.openlibrary.org/b/id/10530758-L.jpg", price: 390 },
    { id: 28, title: "Sonnets", author: "William Shakespeare", img: "https://covers.openlibrary.org/b/id/7222257-L.jpg", price: 150 },
    { id: 29, title: "The Martian", author: "Andy Weir", img: "https://covers.openlibrary.org/b/id/10530759-L.jpg", price: 350 },
    { id: 30, title: "Predictably Irrational", author: "Dan Ariely", img: "https://covers.openlibrary.org/b/id/10530760-L.jpg", price: 420 },
  ]);

  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
      value
    );

  // Function to simulate adding an item to the cart
  const handleAddToCart = (book) => {
    // In a real application, this would dispatch an action (e.g., Redux, Context API)
    // or call a global function to update the cart state in the parent/global context.
    alert(`Book added! (Simulated) "${book.title}" is ready for purchase.`);
    console.log(`Simulated Add to Cart:`, book);
  };


  return (
    <>
      <NavBar />

      <div className="shop-page-wrapper">
        <h1 className="shop-title">📚 The Book Hub: Explore & Buy</h1>
        <p className="shop-subtitle">A curated collection of {inventory.length} titles for technical wizards and personal growth enthusiasts alike.</p>

        <div className="book-grid">
          {inventory.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              formatINR={formatINR}
              handleAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Shop;