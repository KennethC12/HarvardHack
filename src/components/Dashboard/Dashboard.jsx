import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecipeCard from '../RecipeCard/RecipeCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faPlus, faSignOutAlt, faCoins } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import { auth, db } from '../../firebase-config';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { Loader } from '@googlemaps/js-api-loader'; // Google Maps Loader

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cuisineOfTheDay, setCuisineOfTheDay] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [groceryStores, setGroceryStores] = useState([]);
  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    marginTop: '20px',
  };

  const center = useMemo(() => ({
    lat: 42.3770,
    lng: -71.1167,
  }), []);

  const navigate = useNavigate();

  // List of cuisines
  const cuisines = [
    { name: 'Mexican', icon: '🌮' },
    { name: 'Chinese', icon: '🥡' },
    { name: 'Soul', icon: '🍗' },
    { name: 'Korean', icon: '🍲' },
    { name: 'Vietnamese', icon: '🍜' },
    { name: 'American', icon: '🌭' },
    { name: 'Japanese', icon: '🍙' },
    { name: 'Taiwanese', icon: '🍱' },
    { name: 'Indian', icon: '🥘' },
    { name: 'African', icon: '🍛' },
  ];

  // Fetch recipes from Firestore
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'recipes'));
        const fetchedRecipes = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            nutrients: doc.data().nutrients || {}, // Ensure nutrients field exists
          }))
          .filter((recipe) => recipe.title && recipe.imageUrl);
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
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Randomly select "Cuisine of the Day" and set a 24-hour timer
  useEffect(() => {
    const randomizeCuisineOfTheDay = () => {
      const randomIndex = Math.floor(Math.random() * cuisines.length);
      setCuisineOfTheDay(cuisines[randomIndex].name);
      localStorage.setItem('cuisineOfTheDay', cuisines[randomIndex].name);
      localStorage.setItem('cuisineOfTheDayTimestamp', Date.now());
    };

    const storedCuisine = localStorage.getItem('cuisineOfTheDay');
    const storedTimestamp = localStorage.getItem('cuisineOfTheDayTimestamp');
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (!storedCuisine || !storedTimestamp || Date.now() - storedTimestamp > oneDay) {
      randomizeCuisineOfTheDay();
    } else {
      setCuisineOfTheDay(storedCuisine);
    }
  }, [cuisines]);

  // Filter recipes based on search term and cuisine selection
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCuisine || recipe.cuisineType.toLowerCase() === selectedCuisine.toLowerCase())
  );

  const randomRecipes = filteredRecipes.slice(0, 6);

  // Google Maps API integration for grocery stores
  useEffect(() => {
    if (!groceryStores.length) {
      const loader = new Loader({
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        version: 'beta',
        libraries: ['places'],
      });

      loader.load().then((google) => {
        const map = new google.maps.Map(document.getElementById('map'), {
          center: center,
          zoom: 12,
        });

        const service = new google.maps.places.PlacesService(map);
        const request = {
          location: center,
          radius: 8046.72, // 5 miles
          type: ['grocery_or_supermarket'],
        };

        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            setGroceryStores(results);
            results.forEach((store) => {
              new google.maps.Marker({
                position: store.geometry.location,
                map: map,
                title: store.name,
              });
            });
          }
        });
      });
    }
  }, [center, groceryStores]);

  return (
    <div className="dashboard-header-container">
      <div className="dashboard-header">
        <div className="dashboard-combined">
          <Link to="/" className="title-button" onClick={() => setSelectedCuisine('')}>
            <h1>re$ipe</h1>
          </Link>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="icon-group">
            <Link to="/rewards" className="coins-button">
              <FontAwesomeIcon icon={faCoins} />
            </Link>
            <Link to="/cart" className="cart-icon">
              <FontAwesomeIcon icon={faShoppingCart} />
            </Link>
            <Link to="/recipe-form" className="add-button">
              <FontAwesomeIcon icon={faPlus} />
            </Link>
            <button className="sign-out-button" onClick={handleSignOut}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>
      </div>

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

      <hr className="divider-line" />

      {!selectedCuisine && (
        <>
          <div className="cuisine-section">
            <h2>Recommended:</h2>
            <div className="card-grid">
              {randomRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  {...recipe}
                  calories={recipe.nutrients.calories || 'Unknown'}
                  protein={recipe.nutrients.protein || 'Unknown'}
                />
              ))}
            </div>
          </div>

          {/* Display Cuisine of the Day */}
          <div className="cuisine-of-the-day-section">
            <h2>Cuisine of the Day: {cuisineOfTheDay}</h2>
            <div className="card-grid">
              {recipes
                .filter((recipe) => recipe.cuisineType.toLowerCase() === cuisineOfTheDay.toLowerCase())
                .map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    {...recipe}
                    calories={recipe.nutrients.calories || 'Unknown'}
                    protein={recipe.nutrients.protein || 'Unknown'}
                  />
                ))}
            </div>
          </div>

          <div id="map" style={mapContainerStyle}></div>
        </>
      )}

      {selectedCuisine && (
        <div className="cuisine-section">
          <h2>{selectedCuisine} Recipes</h2>
          <div className="card-grid">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                {...recipe}
                calories={recipe.nutrients.calories || 'Unknown'}
                protein={recipe.nutrients.protein || 'Unknown'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
