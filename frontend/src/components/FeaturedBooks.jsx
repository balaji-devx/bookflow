import "../pages/css/App.css";

function FeaturedBooks() {
  const books = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      img: "https://images-na.ssl-images-amazon.com/images/I/81af+MCATTL.jpg",
      price: "500.00",
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      img: "https://images-na.ssl-images-amazon.com/images/I/71kxa1-0zfL.jpg",
      price: "600.00",
    },
    {
      id: 3,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      img: "https://images-na.ssl-images-amazon.com/images/I/81OtwkiB7GL.jpg",
      price: "890.00",
    },
    {
      id: 4,
      title: "The Alchemist",
      author: "Paulo Coelho",
      img: "https://images-na.ssl-images-amazon.com/images/I/71aFt4+OTOL.jpg",
      price: "390.00",
    },
  ];

  return (
    <section className="featured-books">
      <h2 className="section-title">📚 Featured Books</h2>
      <div className="book-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <img src={book.img} alt={book.title} className="book-cover" />
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="author">{book.author}</p>
              <p className="price">{book.price}</p>
              <button className="btn">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedBooks;
