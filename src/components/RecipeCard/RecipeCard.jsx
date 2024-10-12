import React from 'react';
import './RecipeCard.css';  // Import the CSS file

function RecipeCard({ title, imageUrl, cuisineType }) {
  return (
    <div className="recipe-card">
      <h3 className="title">Title: {title}</h3>
      <div className="image-container">
        <img src={imageUrl} alt={title} />
      </div>
      <p className="cuisine">Type of Cuisine: {cuisineType}</p>
    </div>
  );
}

export default RecipeCard;
