import "../pages/css/App.css";

function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "Emily Johnson",
      text: "I love this store! The selection is amazing and my orders always arrive on time. Highly recommended for any book lover!",
      img: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5,
    },
    {
      id: 2,
      name: "Anurag Kapoor",
      text: "The website is so easy to navigate, and the customer service is fantastic. I’ve discovered so many great books here.",
      img: "https://randomuser.me/api/portraits/men/65.jpg",
      rating: 4,
    },
    {
      id: 3,
      name: "Sophie Lee",
      text: "Great prices, fast shipping, and beautiful packaging! I always find something new to read.",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
    },
  ];

  return (
    <section className="testimonials">
      <h2 className="section-title">⭐ What Our Readers Say</h2>
      <div className="testimonials-grid">
        {reviews.map((review) => (
          <div key={review.id} className="testimonial-card">
            <img src={review.img} alt={review.name} className="reviewer-img" />
            <p className="review-text">“{review.text}”</p>
            <div className="review-rating">
              {"⭐".repeat(review.rating)}
            </div>
            <h3 className="reviewer-name">{review.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
