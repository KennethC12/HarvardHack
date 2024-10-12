import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config'; // Ensure this is your Firestore and Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth state change listener
import './Rewards.css';

const Rewards = () => {
  const [orders, setOrders] = useState([]);
  const [coins, setCoins] = useState(0); // Initialize user coin balance
  const [userId, setUserId] = useState(null); // Store the current user's ID

  // Listen for auth state changes and get the user's ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set the user ID if the user is authenticated
        fetchUserCoins(user.uid); // Fetch the coin balance for this user
        fetchOrders(user.uid); // Fetch the user's orders
      } else {
        setUserId(null); // No user is logged in
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch recent purchases and completed recipes
  const fetchOrders = async (uid) => {
    try {
      const purchasesQuery = query(
        collection(db, 'purchases'),
        where('userId', '==', uid), // Filter by the current user's ID
        orderBy('purchaseDate', 'desc') // Order by date, newest first
      );
      const completedQuery = query(
        collection(db, 'completedRecipes'),
        where('userId', '==', uid), // Filter by the current user's ID
        orderBy('completionDate', 'desc') // Order by date, newest first
      );

      const [purchasesSnapshot, completedSnapshot] = await Promise.all([
        getDocs(purchasesQuery),
        getDocs(completedQuery),
      ]);

      const purchases = purchasesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: 'purchase',
      }));

      const completed = completedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: 'completed',
      }));

      const allOrders = [...purchases, ...completed].sort((a, b) =>
        new Date(b.purchaseDate || b.completionDate) - new Date(a.purchaseDate || a.completionDate)
      );

      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch the user's coin balance from Firestore
  const fetchUserCoins = async (uid) => {
    try {
      const userQuery = query(collection(db, 'users'), where('userId', '==', uid));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setCoins(userData.coins || 0); // Set coins, default to 0 if not found
      }
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  };

  // Save the updated coin balance to Firestore
  const updateUserCoins = async (newCoinBalance) => {
    if (!userId) return; // Ensure the user is authenticated

    try {
      // Reference to the user document
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        coins: newCoinBalance, // Update the coins field
      });
      setCoins(newCoinBalance); // Update local state after saving
    } catch (error) {
      console.error('Error updating user coins:', error);
    }
  };

  // Function to convert coins to rewards
  const convertCoinsToRewards = () => {
    if (coins < 100) {
      alert('You need at least 100 coins to convert to rewards.');
    } else {
      const newCoinBalance = coins - 100;
      updateUserCoins(newCoinBalance); // Save the new coin balance to Firestore
      alert('You have successfully converted 100 coins into a reward!');
    }
  };

  return (
    <div className="rewards-container">
      {/* Re$ipe button in the top-left */}
      <Link to="/" className="logo-button">Re$ipe</Link>

      {/* Scrollable Box for Recent and Past Orders */}
      <div className="orders-box-container">
        <div className="orders-box">
          <h2>Recent and Past Orders</h2>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <ul>
              {orders.map((order) => (
                <li key={order.id}>
                  <h3>{order.title}</h3>
                  <p>{order.description}</p>
                  <p>{order.type === 'purchase' ? 'Purchased' : 'Completed'} on: {new Date(order.purchaseDate || order.completionDate).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Rewards Section */}
      <div className="rewards-section">
        <h1 className="rewards-title">Rewards</h1>
        <p>Your reward details will be displayed here.</p>

        {/* Coin Balance Section */}
        <div className="coins-balance">
          <h2>Your Balance: {coins} Coins</h2>
          <button onClick={convertCoinsToRewards} className="convert-button">Convert 100 Coins to Reward</button>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
