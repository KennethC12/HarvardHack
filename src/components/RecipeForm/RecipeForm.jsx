import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';  // For Firebase Storage
import { collection, addDoc } from 'firebase/firestore';  // For Firestore
import { db, storage } from '../../firebase-config';  // Import Firestore and Storage from Firebase config

function RecipeForm() {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('Submit Recipe');

  // Handle image file change
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Handle dynamic ingredient input
  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  // Handle dynamic step input
  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  // Add new ingredient input field
  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  // Add new step input field
  const addStepField = () => {
    setSteps([...steps, '']);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please upload an image");
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading...');

    try {
      // Upload the image to Firebase Storage
      const imageRef = ref(storage, `recipes/${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      // Create a new recipe object
      const newRecipe = {
        title: title,
        ingredients: ingredients,
        steps: steps,
        description: description,
        imageUrl: imageUrl,
      };

      // Add the new recipe to Firestore
      await addDoc(collection(db, 'recipes'), newRecipe);

      // Reset form fields
      setTitle('');
      setIngredients(['']);
      setSteps(['']);
      setDescription('');
      setImageFile(null);
      setUploadStatus('Recipe Submitted!');
    } catch (error) {
      console.error("Error submitting recipe:", error);
      setUploadStatus('Submission Failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="recipe-form">
      {/* Title Input */}
      <div>
        <h2>Title</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter recipe title"
          required
        />
      </div>

      {/* Image Upload */}
      <div>
        <h3>Add Photo</h3>
        <input type="file" accept="image/*" onChange={handleImageChange} required />
      </div>

      {/* Ingredients Section */}
      <div>
        <h3>Add Ingredients</h3>
        {ingredients.map((ingredient, index) => (
          <div key={index}>
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              placeholder={`Ingredient ${index + 1}`}
            />
          </div>
        ))}
        <button type="button" onClick={addIngredientField}>Add More Ingredients</button>
      </div>

      {/* Steps Section */}
      <div>
        <h3>Steps</h3>
        {steps.map((step, index) => (
          <div key={index}>
            <input
              type="text"
              value={step}
              onChange={(e) => handleStepChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
            />
          </div>
        ))}
        <button type="button" onClick={addStepField}>Add More Steps</button>
      </div>

      {/* Description Section */}
      <div>
        <h3>Description</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the recipe..."
          required
        />
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={uploading}>
        {uploadStatus}
      </button>
    </form>
  );
}

export default RecipeForm;
