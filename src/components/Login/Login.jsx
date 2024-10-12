import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const navigate = useNavigate(); // To navigate after login/signup

  const handleAuth = async () => {
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
      alert(error.message); // Handle errors
    }
  };

  return (
    <div className="auth-page">
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
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
      <button onClick={handleAuth}>
        {isLogin ? 'Login' : 'Sign Up'}
      </button>

      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
      </p>
    </div>
  );
}

export default AuthPage;
