import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

function RecipeCard({ id, title, imageUrl, cuisineType, price = 0, difficulty }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="recipe-card" onClick={handleClick}>
      <img
        src={imageUrl || 'https://via.placeholder.com/200'} // Fallback to a placeholder if no image URL is provided
        alt={title}
        className="recipe-image"
      />
      <h3>{title}</h3>
      <p>Cuisine: {cuisineType}</p>
      <p>Difficulty: {difficulty}</p> 
      <p>Price: ${price.toFixed(2)}</p>
      <div className="card-buttons">
        <button className="add-to-cart-button">Add to Cart</button>
        <button className="buy-now-button">Buy Now</button>
      </div>
    </div>
  );
}


export default RecipeCard;
