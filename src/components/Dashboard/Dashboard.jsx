import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecipeCard from '../RecipeCard/RecipeCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faPlus, faSignOutAlt, faCoins } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import { auth, db } from '../../firebase-config'; // Firestore instance and auth
import { signOut } from 'firebase/auth'; // Import signOut from Firebase
import { collection, getDocs } from 'firebase/firestore'; // Firestore functions
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'; // Import Google Maps components

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cuisineOfTheDay, setCuisineOfTheDay] = useState(''); // Store the current cuisine of the day
  const [selectedCuisine, setSelectedCuisine] = useState(''); // Store the selected cuisine for filtering
  const [groceryStores, setGroceryStores] = useState([]);
  const [map, setMap] = useState(null); // Add map state
  const radius = 8046.72; // 5 miles in meters
  const navigate = useNavigate();

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    marginTop: '20px',
  };

  // Memoize the 'center' object using useMemo
  const center = useMemo(() => ({
    lat: 42.3770,  // Harvard University latitude
    lng: -71.1167, // Harvard University longitude
  }), []); // Empty dependency array because the center doesn't change

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
    console.log('Selected Cuisine:', cuisine); // Debugging log
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
    (!selectedCuisine || recipe.cuisineType.toLowerCase() === selectedCuisine.toLowerCase())
  );

  useEffect(() => {
    console.log('Filtered Recipes:', filteredRecipes); // Debugging log
  }, [filteredRecipes]);

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

  // Handle reset to main dashboard
  const handleReset = () => {
    setSelectedCuisine(''); // Clear the selected cuisine
  };

  // Cuisine buttons data
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

  // Google Maps API integration to find grocery stores
  useEffect(() => {
    if (map) {
      const service = new window.google.maps.places.PlacesService(map);
      const request = {
        location: center,  // Use memoized center
        radius: radius, // 5 miles radius
        type: ['grocery_or_supermarket'], // Grocery stores
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setGroceryStores(results);
        }
      });
    }
  }, [map, radius, center]); // Include center in the dependency array

  // On map load, set map instance
  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  return (
    <div className="dashboard-header-container">
      <div className="dashboard-header">
        <div className="dashboard-combined">
          {/* Wrap the h1 title in a Link, reset cuisine when clicked */}
          <Link to="/" className="title-button" onClick={handleReset}>
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
  
      {loading ? (
        <p>Loading recipes...</p>
      ) : (
        <>
          {!selectedCuisine && (
            <>
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
                      price={recipe.price || 0}
                      difficulty={recipe.difficulty || 'Unknown'}
                    />
                  ))}
                </div>
              </div>
  
              <hr className="divider-line" />
  
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
                        price={recipe.price || 0}
                        difficulty={recipe.difficulty || 'Unknown'}
                      />
                    ))}
                  </div>
                  <hr className="divider-line" />
                </div>
              )}
            </>
          )}
  
          {selectedCuisine && groupedRecipes[selectedCuisine] && (
            <div className="cuisine-section">
              <h2>{selectedCuisine} Recipes</h2>
              <div className="card-grid">
                {groupedRecipes[selectedCuisine].map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    imageUrl={recipe.imageUrl}
                    cuisineType={recipe.cuisineType}
                    price={recipe.price || 0}
                    difficulty={recipe.difficulty || 'Unknown'}
                  />
                ))}
              </div>
            </div>
          )}
  
          <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={['places']}>
            <GoogleMap
              id="grocery-map"
              mapContainerStyle={mapContainerStyle}
              center={center} // Use memoized center
              zoom={12}
              onLoad={onMapLoad}
            >
              {groceryStores.map((store) => (
                <Marker
                  key={store.place_id}
                  position={{
                    lat: store.geometry.location.lat(),
                    lng: store.geometry.location.lng(),
                  }}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                  title={store.name}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </>
      )}
    </div>
  );  
}

export default Dashboard;
