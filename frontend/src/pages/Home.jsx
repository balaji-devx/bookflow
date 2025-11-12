import NavBar from '../components/Navbar.jsx';
import Grid from '../components/Grid.jsx'
import FeaturedBooks from '../components/FeaturedBooks.jsx'
import Categories from '../components/Categories.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Newsletter from '../components/NewsLetter.jsx';
import Footer from '../components/footer.jsx';

function Home() {
  return (
    <>
      <NavBar />
      <Grid />
      <FeaturedBooks />
      <Categories />
      <Testimonials />
      <Newsletter />
      <Footer />
    </>
  );
}

export default Home;
