import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from './CartContext'; // Ensure correct path
import './Cart.css'; // For styling the layout
import { auth, db } from '../../firebase-config'; // Import Firebase auth and Firestore
import { doc, getDoc, updateDoc, collection, addDoc, setDoc } from 'firebase/firestore'; // Firestore functions
import { useNavigate } from 'react-router-dom'; // For navigation

const Cart = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);
  const [userId, setUserId] = useState(null); // State to hold the user's ID
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cvc: '',
    expDate: '',
    name: '',
    address: '',
    zipCode: '',
  });
  const [timeFrame, setTimeFrame] = useState('');
  const navigate = useNavigate(); // To navigate after order submission
  const [coins, setCoins] = useState(0); // To store user's coins

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Get the logged-in user's ID
        loadUserInfo(user.uid); // Load saved personal information
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserInfo = async (uid) => {
    const userDocRef = doc(db, 'userInfo', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setPaymentInfo({
        cardNumber: userData.cardNumber || '',
        cvc: userData.cvc || '',
        expDate: userData.expDate || '',
        name: userData.name || '',
        address: userData.address || '',
        zipCode: userData.zipCode || '',
      });
      setCoins(userData.coins || 0); // Load user's existing coins
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Ensure only numbers are entered for cardNumber and cvc
    if ((name === 'cardNumber' || name === 'cvc') && !/^\d*$/.test(value)) return;
    setPaymentInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  // Add the copyRecipeForUser function
  const copyRecipeForUser = async (recipeId, userId) => {
    if (!recipeId || !userId) {
      console.error('Invalid recipeId or userId:', { recipeId, userId });
      return;
    }

    try {
      const recipeDocRef = doc(db, 'recipes', recipeId);
      const recipeDoc = await getDoc(recipeDocRef);

      if (recipeDoc.exists()) {
        const recipeData = recipeDoc.data();

        const userRecipeDocRef = doc(collection(db, 'userRecipes', userId));
        await setDoc(userRecipeDocRef, {
          ...recipeData,
          createdAt: new Date(),
        });

        console.log('Recipe copied successfully for user:', userId);
      } else {
        console.error('Recipe does not exist:', recipeId);
      }
    } catch (error) {
      console.error('Error copying recipe:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentInfo.cardNumber.length !== 16) {
      alert('Card number must be exactly 16 digits.');
      return;
    }

    if (!userId) {
      alert('You need to log in to save your information.');
      return;
    }

    const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);
    const coinReward = Math.floor(totalPrice * 0.2);

    const order = {
      userId: userId || 'N/A', // Ensure this is never undefined
      items: cartItems.map((item) => ({
        recipeId: item.id || 'N/A', // Ensure no undefined recipe IDs
        title: item.title || 'Untitled',
        price: item.price || 0,
        imageUrl: item.imageUrl || '',
      })),
      paymentInfo: {
        name: paymentInfo.name || '',
        address: paymentInfo.address || '',
        zipCode: paymentInfo.zipCode || '',
      },
      totalPrice: totalPrice || 0,
      timeFrame: timeFrame || 'Not specified',
      orderDate: new Date().toISOString(),
    };

    try {
      for (const item of cartItems) {
        if (!item.id) {
          console.error('Cart item is missing id:', item);
          continue; // Skip items with no id
        }

        await copyRecipeForUser(item.id, userId);
      }

      const userOrdersRef = collection(db, 'userInfo', userId, 'orders');
      await addDoc(userOrdersRef, order);

      const userDocRef = doc(db, 'userInfo', userId);
      await updateDoc(userDocRef, {
        coins: coins + coinReward,
      });

      alert(`Order placed successfully! You earned ${coinReward} coins. Redirecting to dashboard...`);
      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place the order. Please try again.');
    }
  };

  if (!cartItems) {
    return <div>Error: Cart context is not available.</div>;
  }

  const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <div className="page-container">
      <div className="cart-box">
        <h2>Your Cart</h2>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {cartItems.map((recipe) => (
              <li key={recipe.id}>
                <h3>{recipe.title}</h3>
                <img src={recipe.imageUrl} alt={recipe.title} width="150" />
                <button onClick={() => removeFromCart(recipe)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="middle-column">
        <div className="personal-info">
          <h2>Payment Information</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Card Number:
              <input
                type="text"
                name="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={handleChange}
                required
                maxLength="16"
                inputMode="numeric"
                pattern="\d{16}"
                title="Please enter a valid 16-digit card number"
              />
            </label>
            <label>
              CVC:
              <input
                type="text"
                name="cvc"
                value={paymentInfo.cvc}
                onChange={handleChange}
                required
                maxLength="4"
                inputMode="numeric"
                pattern="\d{3,4}"
                title="Please enter a valid 3 or 4-digit CVC"
              />
            </label>
            <label>
              Expiration Date:
              <input
                type="text"
                name="expDate"
                value={paymentInfo.expDate}
                onChange={handleChange}
                required
                placeholder="MM/YY"
              />
            </label>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={paymentInfo.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Address:
              <input
                type="text"
                name="address"
                value={paymentInfo.address}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Zip Code:
              <input
                type="text"
                name="zipCode"
                value={paymentInfo.zipCode}
                onChange={handleChange}
                required
              />
            </label>
          </form>
        </div>

        <div className="delivery-time-frame">
          <h2>Delivery Time Frame</h2>
          <label>
            Select Delivery Time Frame:
            <select
              name="timeFrame"
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              required
            >
              <option value="">Select a time frame</option>
              <option value="morning">Morning (8 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
              <option value="evening">Evening (4 PM - 8 PM)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="order-summary">
        <h2>Order Summary</h2>
        <p>Total Price: ${totalPrice.toFixed(2)}</p>
        <p>Earned Coins: {Math.floor(totalPrice * 0.2)}</p>
        <button onClick={handleSubmit}>Place Order</button>
      </div>
    </div>
  );
};

export default Cart;
