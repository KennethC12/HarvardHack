import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RecipeDetail.css';
import { db } from '../../firebase-config';  // Import Firestore instance from your config
import { doc, getDoc } from 'firebase/firestore';  // Firestore functions

function RecipeDetail() {
  const { id } = useParams();  // Get the recipe ID from the URL
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);  // Store the fetched recipe
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state

  // Fetch the recipe from Firestore by its ID
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeDoc = await getDoc(doc(db, 'recipes', id));
        if (recipeDoc.exists()) {
          setRecipe(recipeDoc.data());  // Set the recipe data
        } else {
          setError('Recipe not found.');
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to fetch recipe.');
      } finally {
        setLoading(false);  // Stop loading after fetching
      }
    };

    fetchRecipe();
  }, [id]);  // Fetch recipe when the component mounts and when `id` changes

  if (loading) {
    return (
      <div className="recipe-detail">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-detail">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p>{error}</p>
      </div>
    );
  }

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
