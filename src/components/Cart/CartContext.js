import React, { createContext, useState } from 'react';

// Create the CartContext
export const CartContext = createContext();  // Do not initialize as null

// CartProvider to wrap around components that need the context
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Function to add items to the cart
  const addToCart = (recipe) => {
    setCartItems((prevItems) => [...prevItems, recipe]);
  };

  // Function to remove items from the cart
  const removeFromCart = (recipeTitle) => {
    setCartItems((prevItems) => prevItems.filter(item => item.title !== recipeTitle));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
