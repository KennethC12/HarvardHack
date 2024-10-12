import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore functions
import { auth, db } from '../../firebase-config'; // Firestore instance and Firebase auth
import { onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth state change listener
import RewardsCard from '../RewardsCard/RewardsCard'; // Import RewardsCard component
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
      const ordersQuery = query(
        collection(db, 'userInfo', uid, 'orders'), // Fetch from the user's orders sub-collection
        orderBy('orderDate', 'desc') // Order by date, newest first
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const userOrders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched orders:", userOrders); // Debugging output
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch the user's coin balance from Firestore
  const fetchUserCoins = async (uid) => {
    try {
      const userDocRef = doc(db, 'userInfo', uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setCoins(userData.coins || 0); // Set coins, default to 0 if not found
      }
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  };

  // Handle redeeming gift cards
  const redeemGiftCard = async (cost) => {
    if (coins >= cost) {
      const newCoinBalance = coins - cost;
      try {
        const userDocRef = doc(db, 'userInfo', userId);
        await updateDoc(userDocRef, {
          coins: newCoinBalance,
        });
        setCoins(newCoinBalance); // Update local state
        alert('You have redeemed your gift card!');
      } catch (error) {
        console.error('Error redeeming gift card:', error);
      }
    } else {
      alert('You do not have enough coins to redeem this gift card.');
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
                  <h3>{order.items.map(item => item.title).join(', ')}</h3> {/* Display order item titles */}
                  <p>Total Price: ${order.totalPrice}</p>
                  <p>{order.type === 'purchase' ? 'Purchased' : 'Completed'} on: {new Date(order.orderDate).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Rewards Section */}
      <div className="rewards-section">
        <h1 className="rewards-title">Rewards</h1>
        <p>Your Balance: {coins} Coins</p>

        <div className="rewards-grid">
          <RewardsCard
            cardType="Amazon"
            cardValue="25"
            coinCost={250}
            onRedeem={() => redeemGiftCard(250)}
          />
          <RewardsCard
            cardType="Visa"
            cardValue="50"
            coinCost={500}
            onRedeem={() => redeemGiftCard(500)}
          />
          <RewardsCard
            cardType="Subway"
            cardValue="10"
            coinCost={100}
            onRedeem={() => redeemGiftCard(100)}
          />
        </div>
      </div>
    </div>
  );
};

export default Rewards;
