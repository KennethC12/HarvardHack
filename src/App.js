import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import RecipeForm from './components/RecipeForm/RecipeForm';
import Cart from './components/Cart/Cart'; // Assuming you have a Cart component
import RecipeDetail from './components/RecipeDetail/RecipeDetail'; // New RecipeDescription component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/recipe-form" element={<RecipeForm />} />
        {/* Dynamic route for individual recipe description */}
        <Route path="/recipe/:id" element={<RecipeDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
