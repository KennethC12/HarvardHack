// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';  // Initialize Firebase App
import { getFirestore } from 'firebase/firestore';  // Firestore
import { getStorage } from 'firebase/storage';  // Firebase Storage
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiqk9nWDDk2N3RZXcqU9mgUxfA79VaL4M",
  authDomain: "hackharvard-5d448.firebaseapp.com",
  projectId: "hackharvard-5d448",
  storageBucket: "hackharvard-5d448.appspot.com",
  messagingSenderId: "343949196438",
  appId: "1:343949196438:web:d82ee4117263cc4cbf96b7",
  measurementId: "G-HQ0GFT98TM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const db = getFirestore(app);  // Firestore instance
const storage = getStorage(app);  // Storage instance

// Export db and storage to use in other parts of your app
export { db, storage };