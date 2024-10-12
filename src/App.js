import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; // Firebase auth state change listener
import { auth } from './firebase-config'; // Firebase auth instance
import Dashboard from './components/Dashboard/Dashboard';
import RecipeForm from './components/RecipeForm/RecipeForm';
import Cart from './components/Cart/Cart';
import RecipeDetail from './components/RecipeDetail/RecipeDetail';
import AuthPage from './components/Login/Login'; // The login/signup component
import Rewards from './components/Rewards/Rewards'; // Import the Rewards component
import { CartProvider } from './components/Cart/CartContext'; // Ensure the CartProvider is imported

function App() {
  const [user, setUser] = useState(null); // State to track the current user
  const [loading, setLoading] = useState(true); // State to track if the app is still loading

  // Check if the user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading once we know the user's auth status
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  // Show a loading screen until we determine if the user is logged in
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/cart" element={user ? <Cart /> : <Navigate to="/auth" />} />
          <Route path="/recipe-form" element={user ? <RecipeForm /> : <Navigate to="/auth" />} />
          <Route path="/recipe/:id" element={user ? <RecipeDetail /> : <Navigate to="/auth" />} />
          <Route path="/rewards" element={user ? <Rewards /> : <Navigate to="/auth" />} /> {/* Add new route for rewards */}
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;
