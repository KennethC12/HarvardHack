import React, { useState } from 'react';
import { db, storage } from '../../firebase-config';  // Import Firestore and Storage from your config
import { addDoc, collection } from 'firebase/firestore'; // Firestore functions
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Storage functions
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import './RecipeForm.css';

function RecipeForm() {
  const [title, setTitle] = useState('');
  const [cuisineType, setCuisineType] = useState('Chinese'); // Default to 'Chinese'
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([]);
  const [stepInput, setStepInput] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [difficulty, setDifficulty] = useState('easy'); // Default to 'easy'
  const [price, setPrice] = useState(''); // New state for price
  const [image, setImage] = useState(null);  // For handling the image file
  const [imageUrl, setImageUrl] = useState('');  // For storing the image URL

  // New state for nutrients
  const [calories, setCalories] = useState(''); // Calories
  const [protein, setProtein] = useState(''); // Protein

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If an image is selected, upload it to Firebase Storage first
    if (image) {
      const imageRef = ref(storage, `recipes/${title}-${image.name}`);
      await uploadBytes(imageRef, image);
      const downloadURL = await getDownloadURL(imageRef);
      setImageUrl(downloadURL); // Set the image URL after uploading

      // Prepare the recipe data, including nutrients
      const newRecipe = {
        title: title,
        cuisineType: cuisineType,
        description: description,
        difficulty: difficulty,
        price: parseFloat(price), // Save the price as a float
        ingredients: ingredients,
        steps: steps,
        imageUrl: downloadURL,  // Add the image URL here
        nutrients: {
          calories: parseFloat(calories), // Save the calories as a float
          protein: parseFloat(protein), // Save the protein as a float
        },
      };

      try {
        // Add the new recipe to the "recipes" collection in Firestore
        const docRef = await addDoc(collection(db, 'recipes'), newRecipe);
        console.log('Recipe added successfully with ID: ', docRef.id);

        // Reset the form fields (optional)
        setTitle('');
        setCuisineType('Chinese');
        setDescription('');
        setSteps([]);
        setStepInput('');
        setIngredients([]);
        setIngredientInput('');
        setDifficulty('easy');
        setPrice('');
        setCalories('');  // Reset calories
        setProtein('');  // Reset protein
        setImage(null);
        setImageUrl('');

        // Redirect the user to the homepage
        alert("Recipe added successfully!");
        navigate('/');

      } catch (error) {
        console.error('Error adding recipe: ', error);
        alert('Failed to add the recipe. Please try again.');
      }
    } else {
      alert('Please upload an image');
    }
  };

  // Handle adding ingredients
  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  // Handle adding steps
  const handleAddStep = () => {
    if (stepInput.trim()) {
      setSteps([...steps, stepInput.trim()]);
      setStepInput('');
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="recipe-form">
      <h2>Add a New Recipe</h2>
      <form onSubmit={handleSubmit}>
        {/* Recipe Title */}
        <label>
          Recipe Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        {/* Cuisine Type */}
        <label>
          Cuisine Type:
          <select
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            required
          >
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
            <option value="Vietnamese">Vietnamese</option>
            <option value="Soul">Soul</option>
            <option value="American">American</option>
            <option value="Mexican">Mexican</option>
            <option value="Taiwanese">Taiwanese</option>
            <option value="Indian">Indian</option>
            <option value="African">African</option>
          </select>
        </label>

        {/* Difficulty */}
        <label>
          Difficulty:
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            required
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        {/* Price Input */}
        <label>
          Price:
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price in USD"
            required
          />
        </label>

        {/* Calories Input */}
        <label>
          Calories:
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Enter calories"
            required
          />
        </label>

        {/* Protein Input */}
        <label>
          Protein (g):
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="Enter protein (in grams)"
            required
          />
        </label>

        {/* Description */}
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        {/* Steps */}
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

        {/* Ingredients */}
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

        {/* Image Upload */}
        <label>
          Upload Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        <button type="submit">Add Recipe</button>
      </form>
    </div>
  );
}

export default RecipeForm;
