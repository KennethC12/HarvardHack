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

  // Function to remove an item from the cart
  const removeFromCart = (recipeToRemove) => {
    setCartItems((prevItems) =>
      prevItems.filter((recipe) => recipe.id !== recipeToRemove.id)
    );
  };

  // Function to clear the cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
