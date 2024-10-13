import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faEdit } from '@fortawesome/free-solid-svg-icons'; // Added edit icon
import './RecipeCard.css';
import { useCart } from '../Cart/CartContext';

function RecipeCard({ id, title, imageUrl, cuisineType, price = 0, difficulty, calories, protein }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Handle card click to navigate to recipe details
  const handleClick = () => {
    navigate(`/recipe/${id}`);
  };

  // Handle adding recipe to cart
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click
    const recipe = { id, title, imageUrl, cuisineType, price, difficulty, calories, protein };
    addToCart(recipe);
    alert(`${title} added to cart!`);
  };

  // Handle edit button click to navigate to edit page
  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/edit-recipe/${id}`); // Navigate to the edit page with the recipe ID
  };

  return (
    <div className="recipe-card" onClick={handleClick}>
      {/* Edit Button at the top left */}
      <button className="edit-recipe-button" onClick={handleEditClick}>
        <FontAwesomeIcon icon={faEdit} /> {/* Edit icon */}
      </button>

      {/* Card Content */}
      <img
        src={imageUrl || 'https://via.placeholder.com/200'}
        alt={title}
        className="recipe-image"
      />
      <h3>{title}</h3>
      <p>Cuisine: {cuisineType}</p>
      <p>Difficulty: {difficulty}</p>
      <p>Price: ${price.toFixed(2)}</p>

      {/* Display Calories and Protein */}
      <p>Calories: {calories}</p>
      <p>Protein: {protein}</p>

      <div className="card-buttons">
        <button className="add-to-cart-button" onClick={handleAddToCart}>
          <FontAwesomeIcon icon={faShoppingCart} /> {/* Cart icon */}
        </button>
        <button className="buy-now-button">Buy</button>
      </div>
    </div>
  );
}

export default RecipeCard;
