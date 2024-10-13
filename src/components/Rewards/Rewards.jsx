import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore functions
import { auth, db, storage } from '../../firebase-config'; // Firestore instance and Firebase auth
import { onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth state change listener
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Firebase storage
import RewardsCard from '../RewardsCard/RewardsCard'; // Import RewardsCard component
import './Rewards.css';
import logoImage from '../../assets/logo-removebg-preview.png'; // Import the logo image from your assets

const Rewards = () => {
  const [orders, setOrders] = useState([]);
  const [coins, setCoins] = useState(0); // Initialize user coin balance
  const [userId, setUserId] = useState(null); // Store the current user's ID
  const [imageUploads, setImageUploads] = useState({}); // Track image uploads for each order
  const [uploading, setUploading] = useState({}); // Track upload state for each order
  const [submitted, setSubmitted] = useState({}); // Track submission state for each order

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
        submitted: doc.data().submitted || false, // Add the `submitted` field to track if the order is already submitted
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

  // Function to calculate coins based on difficulty
  const calculateCoins = (difficulty) => {
    let coinsEarned = 0;
    switch (difficulty) {
      case 'easy':
        coinsEarned = 5;
        break;
      case 'medium':
        coinsEarned = 10;
        break;
      case 'hard':
        coinsEarned = 15;
        break;
      default:
        coinsEarned = 0; // Fallback in case difficulty isn't provided
    }
    console.log(`Difficulty: ${difficulty}, Coins Earned: ${coinsEarned}`); // Debugging log
    return coinsEarned;
  };

  // Handle image selection for each order
  const handleImageChange = (orderId, event) => {
    const file = event.target.files[0];
    setImageUploads((prevState) => ({
      ...prevState,
      [orderId]: file,
    }));
  };

  // Handle image upload for each order and give coins based on the difficulty
  const handleImageUpload = async (orderId, item) => {
    const imageFile = imageUploads[orderId];
    if (!imageFile) {
      alert('Please select an image.');
      return;
    }

    setUploading((prevState) => ({
      ...prevState,
      [orderId]: true, // Set the specific order's uploading state to true
    }));

    const storageRef = ref(storage, `orders/${userId}/${orderId}/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error('Upload failed:', error);
        setUploading((prevState) => ({
          ...prevState,
          [orderId]: false, // Stop uploading state
        }));
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('File available at', downloadURL);
        setUploading((prevState) => ({
          ...prevState,
          [orderId]: false, // Stop uploading state
        }));

        const orderDocRef = doc(db, 'userInfo', userId, 'orders', orderId);
        const orderSnapshot = await getDoc(orderDocRef);

        if (orderSnapshot.exists()) {
          const orderData = orderSnapshot.data();
          const difficulty = orderData.difficulty || 'easy';

          // Calculate coins based on the order's difficulty
          const coinsEarned = calculateCoins(difficulty);

          // Fetch latest coin balance from Firestore before updating
          const userDocRef = doc(db, 'userInfo', userId);
          const userSnapshot = await getDoc(userDocRef);
          const currentCoins = userSnapshot.exists() ? userSnapshot.data().coins || 0 : 0;

          console.log(`Current coins: ${currentCoins}, Coins earned: ${coinsEarned}`);

          if (coinsEarned > 0) {
            // Update Firestore to add the earned coins and mark the order as submitted
            const updatedCoins = currentCoins + coinsEarned;
            await updateDoc(userDocRef, {
              coins: updatedCoins, // Update with new total coins
            });

            // Mark the order as submitted in Firestore
            await updateDoc(orderDocRef, {
              submitted: true, // Update submitted status in Firestore
            });

            // Update local coins state
            setCoins((prevCoins) => prevCoins + coinsEarned);

            // Mark this order as submitted locally
            setSubmitted((prevState) => ({
              ...prevState,
              [orderId]: true,
            }));

            alert(`Upload successful! You've earned ${coinsEarned} coins.`);
          } else {
            alert('Upload successful, but no coins earned due to invalid difficulty.');
          }
        } else {
          console.error('Order document not found.');
        }
      }
    );
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
      {/* Image button instead of title link */}
      <Link to="/" className="logo-button">
        <img src={logoImage} alt="Re$ipe" className="logo-image" />
      </Link>

      {/* Title for Recent and Past Orders */}
      <div className="orders-title-container">
        <h2 className="orders-title">Recent and Past Orders</h2>
      </div>

      {/* Scrollable Box for Recent and Past Orders */}
      <div className="orders-box-container">
        <div className="orders-box">
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <ul className="orders-list">
              {orders.map((order) => (
                <li key={order.id} className="order-item">
                  {order.items.map(item => (
                    <div key={item.id} className="order-item-details">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="order-image" />
                      )}
                      <div className="order-info">
                        <h3>{item.title}</h3>
                        <p>Price: ${item.price}</p>
                        <p>Difficulty: {item.difficulty}</p>
                      </div>
                    </div>
                  ))}
                  <p>Order Total: ${order.totalPrice}</p>
                  <p>Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>

                  {/* Upload and Submit Button for each order */}
                  <div className="upload-section">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(order.id, e)}
                      disabled={submitted[order.id]} // Disable after submission
                    />
                    <button
                      onClick={() => handleImageUpload(order.id, order.items[0])} // Passing first item (if multiple, adjust accordingly)
                      disabled={uploading[order.id] || !imageUploads[order.id] || submitted[order.id]} // Disable after submission
                    >
                      {uploading[order.id] ? 'Uploading...' : 'Submit'}
                    </button>
                  </div>
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
