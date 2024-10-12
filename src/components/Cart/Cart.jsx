import React from 'react';
import { Link } from 'react-router-dom';

function Cart() {
  return (
    <div>
      <h2>Your Cart</h2>
      {/* Cart items go here */}
      <Link to="/">← Back to Dashboard</Link>
    </div>
  );
}

export default Cart;
