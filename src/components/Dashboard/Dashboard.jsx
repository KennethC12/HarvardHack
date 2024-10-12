import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../RecipeCard/RecipeCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faPlus } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import { recipes } from '../../data/recipes'; // Adjust the path based on your folder structure

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter the recipes based on the search term
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique cuisine types from filtered recipes
  const cuisineTypes = [
    ...new Set(filteredRecipes.map((recipe) => recipe.cuisineType)),
  ];

  return (
    <div className="dashboard">
      {/* Header with Search Bar, Title, Cart Icon, and Plus Icon */}
      <header className="dashboard-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <h1>re$ipe</h1>
        <div className="icon-group">
          <Link to="/cart" className="cart-icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </Link>
          <Link to="/recipe-form" className="add-button">
            <FontAwesomeIcon icon={faPlus} />
          </Link>
        </div>
      </header>

      {/* Recommended Section */}
      <h2>Recommended</h2>
      <div className="card-grid">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              imageUrl={recipe.imageUrl}
              cuisineType={recipe.cuisineType}
            />
          ))
        ) : (
          <p>No recipes found.</p>
        )}
      </div>

      {/* Dynamic Cuisine Sections */}
      {cuisineTypes.map((cuisine) => {
        // Filter recipes for the current cuisine type
        const cuisineRecipes = filteredRecipes.filter(
          (recipe) => recipe.cuisineType === cuisine
        );

        return (
          <div key={cuisine}>
            <h2>{cuisine}</h2>
            <div className="card-grid">
              {cuisineRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  imageUrl={recipe.imageUrl}
                  cuisineType={recipe.cuisineType}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Dashboard;
