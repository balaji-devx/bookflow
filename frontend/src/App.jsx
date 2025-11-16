import { Routes, Route } from "react-router-dom";
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Profile from "./pages/Profile.jsx";
import Cart from "./pages/Cart.jsx";
import Shop from "./pages/Shop.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/shop" element={<Shop />} />
    </Routes>
  );
}

export default App;
