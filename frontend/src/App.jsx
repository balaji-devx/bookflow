import { Routes, Route } from "react-router-dom";
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Profile from "./pages/Profile.jsx";
import Cart from "./pages/Cart.jsx";
import Shop from "./pages/Shop.jsx";
import Signup from "./pages/Signup.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Checkout from "./pages/Checkout.jsx";
import Borrow from "./pages/Borrow.jsx";
import Lend from "./pages/Lend.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/borrow" element={<Borrow />} />
      <Route path="/lend" element={<Lend />} />
    </Routes>
  );
}

export default App;
