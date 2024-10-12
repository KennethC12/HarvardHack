import React, { useState } from 'react';
import axios from 'axios';
import './RecipeForm.css';

function RecipeForm() {
  const [title, setTitle] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([]);
  const [stepInput, setStepInput] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [recipeId, setRecipeId] = useState(''); // ID for recipe
  const [difficulty, setDifficulty] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the recipe data
    const newRecipe = {
      "Recipie Name": title,
      "Description": description,
      "Recipie ID": recipeId,
      "Difficulty": difficulty,
      "Ingredients": ingredients,
      "Steps": steps,
    };

    try {
      // Send a POST request to your Flask API
      const response = await axios.post('http://localhost:5000/add_recipe', newRecipe);
      console.log('Recipe added successfully:', response.data);
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  };

  // Handle adding ingredients
  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput]);
      setIngredientInput('');
    }
  };

  // Handle adding steps
  const handleAddStep = () => {
    if (stepInput.trim()) {
      setSteps([...steps, stepInput]);
      setStepInput('');
    }
  };

  return (
    <div className="recipe-form">
      <h2>Add a New Recipe</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Recipe Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Recipe ID:
          <input
            type="text"
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
            required
          />
        </label>

        <label>
          Cuisine Type:
          <input
            type="text"
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            required
          />
        </label>

        <label>
          Difficulty:
          <input
            type="text"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        {/* Steps Input */}
        <label>
          Steps:
          <div className="step-input">
            <input
              type="text"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              placeholder="Enter a step"
            />
            <button type="button" onClick={handleAddStep}>
              Add Step
            </button>
          </div>
          <ul>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </label>

        {/* Ingredients Input */}
        <label>
          Ingredients:
          <div className="ingredient-input">
            <input
              type="text"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              placeholder="Enter an ingredient"
            />
            <button type="button" onClick={handleAddIngredient}>
              Add Ingredient
            </button>
          </div>
          <ul>
            {ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </label>

        <button type="submit">Add Recipe</button>
      </form>
    </div>
  );
}

export default RecipeForm;
