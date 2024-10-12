// RecipeCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

function RecipeCard({ id, title, imageUrl, cuisineType }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="recipe-card" onClick={handleClick}>
      <img src={imageUrl} alt={title} />
      <h3>{title}</h3>
      <p>{cuisineType}</p>
    </div>
  );
}

export default RecipeCard;
