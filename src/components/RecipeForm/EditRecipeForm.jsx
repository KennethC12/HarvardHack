import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore functions for updating
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Storage functions
import { useNavigate, useParams } from 'react-router-dom'; // For navigation and accessing recipe ID
import './RecipeForm.css';

function EditRecipeForm() {
  const [title, setTitle] = useState('');
  const [cuisineType, setCuisineType] = useState('Chinese');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [difficulty, setDifficulty] = useState('easy');
  const [price, setPrice] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [image, setImage] = useState(null); 
  const [imageUrl, setImageUrl] = useState('');

  const { id } = useParams(); // Get the recipe ID from the URL
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the recipe data from Firestore
    const fetchRecipe = async () => {
      const docRef = doc(db, 'recipes', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const recipeData = docSnap.data();
        setTitle(recipeData.title);
        setCuisineType(recipeData.cuisineType);
        setDescription(recipeData.description);
        setSteps(recipeData.steps);
        setIngredients(recipeData.ingredients);
        setDifficulty(recipeData.difficulty);
        setPrice(recipeData.price);
        setCalories(recipeData.nutrients?.calories || '');
        setProtein(recipeData.nutrients?.protein || '');
        setImageUrl(recipeData.imageUrl);
      } else {
        alert('Recipe not found');
      }
    };

    fetchRecipe();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recipeRef = doc(db, 'recipes', id);

    const updatedRecipe = {
      title: title,
      cuisineType: cuisineType,
      description: description,
      difficulty: difficulty,
      price: parseFloat(price),
      ingredients: ingredients,
      steps: steps,
      nutrients: {
        calories: parseFloat(calories),
        protein: parseFloat(protein),
      },
    };

    try {
      // Check if an image was uploaded
      if (image) {
        const imageRef = ref(storage, `recipes/${title}-${image.name}`);
        await uploadBytes(imageRef, image);
        const downloadURL = await getDownloadURL(imageRef);
        updatedRecipe.imageUrl = downloadURL; // Update the image URL
      } else {
        updatedRecipe.imageUrl = imageUrl; // Keep the existing image URL
      }

      // Update the recipe in Firestore
      await updateDoc(recipeRef, updatedRecipe);
      alert('Recipe updated successfully!');
      navigate('/'); // Redirect to the homepage after editing
    } catch (error) {
      console.error('Error updating recipe: ', error);
      alert('Failed to update the recipe. Please try again.');
    }
  };

  return (
    <div className="recipe-form">
      <h2>Edit Recipe</h2>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <label>
          Title:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        {/* Cuisine Type */}
        <label>
          Cuisine Type:
          <select value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} required>
            <option value="Mexican">Mexican</option>
            <option value="Chinese">Chinese</option>
            <option value="Soul">Soul</option>
            <option value="Korean">Korean</option>
            <option value="Vietnamese">Vietnamese</option>
            <option value="American">American</option>
            <option value="Japanese">Japanese</option>
            <option value="Taiwanese">Taiwanese</option>
            <option value="Indian">Indian</option>
            <option value="African">African</option>
          </select>
        </label>

        {/* Difficulty */}
        <label>
          Difficulty:
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        {/* Price */}
        <label>
          Price:
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>

        {/* Calories */}
        <label>
          Calories:
          <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} required />
        </label>

        {/* Protein */}
        <label>
          Protein (g):
          <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} required />
        </label>

        {/* Additional fields for description, steps, ingredients, image upload */}
        <button type="submit">Update Recipe</button>
      </form>
    </div>
  );
}

export default EditRecipeForm;
