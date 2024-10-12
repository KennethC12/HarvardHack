// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import RecipeDetail from './components/RecipeDetail/RecipeDetail';
import Cart from './components/Cart/Cart'; // If you have a Cart component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/cart" element={<Cart />} />
        {/* Add other routes if needed */}
      </Routes>
    </Router>
  );
}

export default App;
