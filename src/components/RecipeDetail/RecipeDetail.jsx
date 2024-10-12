// RecipeDetail.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RecipeDetail.css';
import { recipes } from '../../data/recipes';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the recipe that matches the id from the URL
  const recipe = recipes.find((recipe) => recipe.id === parseInt(id));

  if (!recipe) {
    return (
      <div className="recipe-detail">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p>Recipe not found.</p>
      </div>
    );
  }

  return (
    <div className="recipe-detail">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>{recipe.title}</h1>

      {/* Top Row: Photo and Ingredients */}
      <div className="top-row">
        <div className="photo-container">
          <img src={recipe.imageUrl} alt={recipe.title} className="recipe-image" />
        </div>
        <div className="ingredients-container">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Row: Description and Steps */}
      <div className="bottom-row">
        <div className="description-container">
          <h2>Description</h2>
          <p className="description">{recipe.description}</p>
        </div>
        <div className="steps-container">
          <h2>Instructions</h2>
          <ol className="steps-list">
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
