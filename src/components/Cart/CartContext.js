import React, { createContext, useState, useContext } from 'react';

// Create a context for the cart
export const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// CartProvider component to provide the cart context to the app
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Function to add items to the cart, avoiding duplicates
  const addToCart = (recipe) => {
    setCartItems((prevItems) => {
      // Check if the item is already in the cart
      const itemExists = prevItems.find((item) => item.id === recipe.id);
      if (itemExists) {
        alert(`${recipe.title} is already in the cart!`);
        return prevItems; // If item exists, return the current cart without adding a duplicate
      }
      return [...prevItems, recipe]; // If not, add the item to the cart
    });
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
