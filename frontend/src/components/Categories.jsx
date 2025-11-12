import "../pages/css/App.css";

function Categories() {
  const categories = [
    {
      id: 1,
      name: "Fiction",
      img: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 2,
      name: "Non-Fiction",
      img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 3,
      name: "Self-Help",
      img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 4,
      name: "Children’s Books",
      img: "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 5,
      name: "Romance",
      img: "https://images.unsplash.com/photo-1496104679561-38d6b727efc0?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 6,
      name: "Science & Tech",
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=60",
    },
  ];

  return (
    <section className="categories-section">
      <h2 className="section-title">📖 Explore by Category</h2>
      <div className="category-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="category-card">
            <img src={cat.img} alt={cat.name} className="category-img" />
            <div className="category-overlay">
              <h3>{cat.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
