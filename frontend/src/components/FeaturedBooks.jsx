import "../pages/css/App.css";
import { useCart } from '../context/CartContext'; //  NEW: Import Cart Context

function FeaturedBooks() {
  //  NEW: Get the context handler for adding items
  const { handleAddToCart } = useCart(); 

  const books = [
    {
      id: "1", // Use strings for consistency with MongoDB IDs
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      img: "https://images-na.ssl-images-amazon.com/images/I/81af+MCATTL.jpg",
      price: 500.00, // Use number type for price
    },
    {
      id: "2",
      title: "1984",
      author: "George Orwell",
      img: "https://images-na.ssl-images-amazon.com/images/I/81af+MCATTL.jpg",
      price: 600.00,
    },
    {
      id: "3",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      img: "https://images-na.ssl-images-amazon.com/images/I/71aFt4+OTOL.jpg",
      price: 890.00,
    },
    {
      id: "4",
      title: "The Alchemist",
      author: "Paulo Coelho",
      img: "https://images-na.ssl-images-amazon.com/images/I/71aFt4+OTOL.jpg",
      price: 390.00,
    },
  ];

  // Utility function to format the price (replicated from Shop.jsx for clarity)
  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

  return (
    <section className="featured-books">
      <h2 className="section-title"> Featured Books</h2>
      <div className="book-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <img src={book.img} alt={book.title} className="book-cover" />
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="author">{book.author}</p>
              {/* Display the price using the formatter */}
              <p className="price"><strong>{formatINR(book.price)}</strong></p> 
              
              {/*  FIX: Add onClick handler to call the context function */}
              <button 
                className="btn"
                onClick={() => handleAddToCart(book)}
              >
                + Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedBooks;