import React, { createContext, useState } from 'react';

// Create a context for the cart
export const CartContext = createContext();

// CartProvider component to provide the cart context to the app
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Function to add items to the cart
  const addToCart = (recipe) => {
    setCartItems((prevItems) => [...prevItems, recipe]);
  };

  // Function to remove an item from the cart by recipe id
  const removeFromCart = (recipeToRemove) => {
    setCartItems((prevItems) =>
      prevItems.filter((recipe) => recipe.id !== recipeToRemove.id) // Remove based on unique ID
    );
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
