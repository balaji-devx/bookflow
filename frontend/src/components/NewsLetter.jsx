import "../pages/css/App.css";

function Newsletter() {
  return (
    <section className="newsletter">
      <div className="newsletter-content">
        <h2>📬 Stay Updated!</h2>
        <p>
          Subscribe to our newsletter and get the latest updates on new arrivals,
          exclusive deals, and reading recommendations straight to your inbox.
        </p>

        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email address"
            className="newsletter-input"
            required
          />
          <button type="submit" className="newsletter-btn">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default Newsletter;
