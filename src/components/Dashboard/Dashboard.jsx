import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecipeCard from '../RecipeCard/RecipeCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faPlus, faSignOutAlt, faCoins } from '@fortawesome/free-solid-svg-icons'; // Added faSignOutAlt icon
import './Dashboard.css';
import { auth, db } from '../../firebase-config'; // Firestore instance and auth
import { signOut } from 'firebase/auth'; // Import signOut from Firebase
import { collection, getDocs } from 'firebase/firestore'; // Firestore functions


function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cuisineOfTheDay, setCuisineOfTheDay] = useState(''); // Store the current cuisine of the day
  const [selectedCuisine, setSelectedCuisine] = useState(''); // Store the selected cuisine for filtering
  const navigate = useNavigate();

  // Fetch recipes from Firestore on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'recipes'));
        const fetchedRecipes = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((recipe) => recipe.title && recipe.imageUrl); // Filter out empty recipes
        setRecipes(fetchedRecipes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Handle cuisine selection
  const handleCuisineSelect = (cuisine) => {
    setSelectedCuisine(cuisine);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/auth'); // Redirect to the login/signup page after sign-out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Group the recipes by cuisine type
  const groupByCuisineType = (recipes) => {
    return recipes.reduce((groups, recipe) => {
      const cuisine = recipe.cuisineType;
      if (!groups[cuisine]) {
        groups[cuisine] = [];
      }
      groups[cuisine].push(recipe);
      return groups;
    }, {});
  };

  // Filter the recipes based on the search term and selected cuisine
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCuisine || recipe.cuisineType === selectedCuisine)
  );

  // Group the filtered recipes by cuisine type
  const groupedRecipes = groupByCuisineType(filteredRecipes);

  // Randomize the filtered recipes
  const getRandomRecipes = (recipes, num) => {
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num); // Return the number of random recipes
  };

  const randomRecipes = getRandomRecipes(filteredRecipes, 6); // Randomly choose 6 recipes

  // Update the "Cuisine of the Day" every 24 hours
  useEffect(() => {
    if (Object.keys(groupedRecipes).length > 0) {
      const cuisines = Object.keys(groupedRecipes);
      const changeCuisine = () => {
        const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
        setCuisineOfTheDay(randomCuisine);
      };

      changeCuisine(); // Set the initial cuisine
      const interval = setInterval(changeCuisine, 86400000); // Change every 24 hours

      return () => clearInterval(interval); // Clean up interval on component unmount
    }
  }, [groupedRecipes]);

  // Cuisine buttons data
  const cuisines = [
    { name: 'Mexican', icon: '🌮' }, // Replace with actual icon or image
    { name: 'Chinese', icon: '🥡' },
    { name: 'Soul Food', icon: '🍗' },
    { name: 'Korean', icon: '🍲' },
    { name: 'Vietnamese', icon: '🍜' },
    { name: 'American', icon: '🌭' },
    { name: 'Japanese', icon: '🍙' },
    { name: 'Taiwanese', icon: '🍱' },
  ];

  return (
    <div className="dashboard-header-container">
      <div className="dashboard-header">
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
          {/* Add the coin icon as a link */}
          <Link to="/rewards" className="coins-button">
            <FontAwesomeIcon icon={faCoins} />
          </Link>
          <Link to="/cart" className="cart-icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </Link>
          <Link to="/recipe-form" className="add-button">
            <FontAwesomeIcon icon={faPlus} />
          </Link>
          {/* Sign out button */}
          <button className="sign-out-button" onClick={handleSignOut}>
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>

      {/* Cuisine Button Group */}
      <div className="cuisine-button-group">
        {cuisines.map((cuisine) => (
          <button
            key={cuisine.name}
            className="cuisine-button"
            onClick={() => handleCuisineSelect(cuisine.name)}
          >
            <span className="cuisine-icon">{cuisine.icon}</span>
            <span className="cuisine-label">{cuisine.name}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading recipes...</p>
      ) : (
        <>
          {/* Recommended Section */}
          <div className="cuisine-section">
            <h2>Recommended</h2>
            <div className="card-grid">
              {randomRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  imageUrl={recipe.imageUrl}
                  cuisineType={recipe.cuisineType}
                />
              ))}
            </div>
            <hr className="divider-line" />
          </div>

          {/* Cuisine of the Day Section */}
          {cuisineOfTheDay && groupedRecipes[cuisineOfTheDay] && (
            <div className="cuisine-section">
              <h2>Cuisine of the Day: {cuisineOfTheDay}</h2>
              <div className="card-grid">
                {groupedRecipes[cuisineOfTheDay].map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    imageUrl={recipe.imageUrl}
                    cuisineType={recipe.cuisineType}
                  />
                ))}
              </div>
              <hr className="divider-line" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
