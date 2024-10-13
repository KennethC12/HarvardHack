import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from './CartContext'; // Ensure correct path
import './Cart.css'; // For styling the layout
import { auth, db } from '../../firebase-config'; // Import Firebase auth and Firestore
import { doc, getDoc, updateDoc, collection, addDoc, setDoc } from 'firebase/firestore'; // Firestore functions
import { useNavigate } from 'react-router-dom'; // For navigation
import DeleteIcon from '@mui/icons-material/Delete'; // Import the Delete icon from Material UI

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const [userId, setUserId] = useState(null);
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
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); 
        loadUserInfo(user.uid); 
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
      setCoins(userData.coins || 0); 
      setTimeFrame(userData.timeFrame || ''); 
    } else {
      await setDoc(userDocRef, {
        cardNumber: '',
        cvc: '',
        expDate: '',
        name: '',
        address: '',
        zipCode: '',
        timeFrame: '',
        coins: 0, 
      });
      setCoins(0); 
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'cardNumber' || name === 'cvc') && !/^\d*$/.test(value)) return;
    setPaymentInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
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

    const totalPrice = cartItems.reduce((total, item) => total + (item.price || 0), 0);
    const coinReward = Math.floor(totalPrice * 0.2);

    const order = {
      userId: userId || 'N/A',
      items: cartItems.map((item) => ({
        recipeId: item.id || 'N/A',
        title: item.title || 'Untitled',
        price: item.price || 0,
        imageUrl: item.imageUrl || '',
        difficulty: item.difficulty || 'easy',
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
      const userOrdersRef = collection(db, 'userInfo', userId, 'orders');
      await addDoc(userOrdersRef, order);

      const userDocRef = doc(db, 'userInfo', userId);
      await updateDoc(userDocRef, {
        cardNumber: paymentInfo.cardNumber,
        cvc: paymentInfo.cvc,
        expDate: paymentInfo.expDate,
        name: paymentInfo.name,
        address: paymentInfo.address,
        zipCode: paymentInfo.zipCode,
        timeFrame: timeFrame,
        coins: coins + coinReward, 
      });

      alert(`Order placed successfully! You earned ${coinReward} coins.`);
      clearCart();
      navigate('/'); 
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place the order. Please try again.');
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.price || 0), 0);

  const todayTimeFrames = [
    'Morning (8 AM - 12 PM)',
    'Afternoon (12 PM - 4 PM)',
    'Evening (4 PM - 8 PM)',
  ];

  const tomorrowTimeFrames = [
    'Morning (8 AM - 12 PM)',
    'Afternoon (12 PM - 4 PM)',
    'Evening (4 PM - 8 PM)',
  ];

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="back-button">Back</button> {/* Back Button */}

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
                <p>Difficulty: {recipe.difficulty}</p>
                <p>Price: ${(recipe.price || 0).toFixed(2)}</p>
                <button onClick={() => removeFromCart(recipe)} className="remove-button">
                  <DeleteIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="middle-column">
        <details className="personal-info-dropdown">
          <summary>Personal Information</summary>
          <div className="personal-info">
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
                Expiration Date (MM/YY):
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
        </details>

        <div className="delivery-time-frame">
          <h2>Delivery Time Frame</h2>
          <h3></h3>
          <label>
            Select:
            <label> </label>
            <select
              name=" timeFrame"
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              required
            >
              <option value="">Select a time frame </option>
              <optgroup label="Today">
                {todayTimeFrames.map((timeFrame) => (
                  <option key={timeFrame} value={timeFrame}>
                    {timeFrame}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Tomorrow">
                {tomorrowTimeFrames.map((timeFrame) => (
                  <option key={timeFrame} value={timeFrame}>
                    {timeFrame}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>
      </div>

      <div className="order-summary">
        <h2>Order Summary</h2>
        {cartItems.length === 0 ? (
          <p>No items in order</p>
        ) : (
          <ul>
            {cartItems.map((recipe, index) => (
              <li key={index} className="order-item">
                <p>{recipe.title}: ${(recipe.price || 0).toFixed(2)}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="summary-details">
          <p>Total Price: ${totalPrice.toFixed(2)}</p>
          <p>Earned Coins: {Math.floor(totalPrice * 0.2)}</p>
        </div>
        <button onClick={handleSubmit}>Place Order</button>
      </div>
    </div>
  );
};

export default Cart;
