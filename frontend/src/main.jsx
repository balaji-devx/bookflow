// src/main.jsx (Corrected)

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import CartProvider from './context/CartContext'; // 👈 IMPORT THE DEFAULT EXPORT (The Fix for HMR)

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 🎯 WRAP THE APP WITH THE PROVIDER */}
      <CartProvider> 
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);