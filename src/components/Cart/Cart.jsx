import React, { useContext } from 'react';
import { CartContext} from './CartContext'; // Ensure correct path


const Cart = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);

  if (!cartItems) {
    return <div>Error: Cart context is not available.</div>;
  }

  return (
    <div>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cartItems.map((recipe) => (
            <li key={recipe.id}>
              <h3>{recipe.title}</h3>
              <img src={recipe.imageUrl} alt={recipe.title} width="150" />
              <button onClick={() => removeFromCart(recipe)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
