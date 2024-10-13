import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import './Login.css';

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [error, setError] = useState(''); // To display any errors
  const [loading, setLoading] = useState(false); // Track loading state
  const navigate = useNavigate(); // To navigate after login/signup

  const handleAuth = async () => {
    // Clear previous error
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Login logic
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Signup logic
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/'); // Redirect to dashboard after successful login/signup
    } catch (error) {
      setError(error.message); // Display error message
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      
      {error && <p className="error-message">{error}</p>} {/* Display error message */}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <button onClick={handleAuth} disabled={loading}>
        {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
      </button>

      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
      </p>
    </div>
  );
}

export default AuthPage;
