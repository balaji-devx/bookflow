// src/context/CartContext.jsx

import { createContext, useState, useContext } from 'react';

// 1. Create the Context
const CartContext = createContext();

// 2. Create a Provider Component (Renamed to local const)
const CartProvider = ({ children }) => { // 👈 REMOVED 'export' here
    const [cartItems, setCartItems] = useState([]); 

    const handleAddToCart = (book) => {
        const existingItem = cartItems.find(item => item.id === book.id);

        if (existingItem) {
            // If exists, increase the quantity
            setCartItems(prev => 
                prev.map(item => 
                    item.id === book.id 
                        ? { ...item, qty: item.qty + 1 } 
                        : item
                )
            );
        } else {
            // If new, add it with quantity 1
            setCartItems(prev => [...prev, { ...book, qty: 1 }]);
        }
       // alert(`Book added! (Simulated) "${book.title}" added to cart.`);
    };
    
    const changeQty = (id, delta) => {
        setCartItems((prev) =>
          prev
            .map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it))
            .filter(it => it.qty > 0) // Remove item if qty drops to 0
        );
    };

    const removeItem = (id) => {
        setCartItems((prev) => prev.filter((it) => it.id !== id));
    };

    const contextValue = {
        cartItems,
        handleAddToCart,
        changeQty,
        removeItem
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

// 3. Export the custom hook as a named export (Correct)
export const useCart = () => useContext(CartContext);

// 4. Export the Provider as the DEFAULT export (Correct structure for HMR)
export default CartProvider;