import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'; // Importing cart icon
import './RecipeCard.css';

function RecipeCard({ id, title, imageUrl, cuisineType, price = 0, difficulty }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="recipe-card" onClick={handleClick}>
      <img
        src={imageUrl || 'https://via.placeholder.com/200'}
        alt={title}
        className="recipe-image"
      />
      <h3>{title}</h3>
      <p>Cuisine: {cuisineType}</p>
      <p>Difficulty: {difficulty}</p> 
      <p>Price: ${price.toFixed(2)}</p>
      <div className="card-buttons">
        <button className="add-to-cart-button">
          <FontAwesomeIcon icon={faShoppingCart} /> {/* Cart icon */}
        </button>
        <button className="buy-now-button">Buy </button>
      </div>
    </div>
  );
}

export default RecipeCard;
