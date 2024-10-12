// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';  // Initialize Firebase App
import { getFirestore } from 'firebase/firestore';  // Firestore
import { getStorage } from 'firebase/storage';  // Firebase Storage
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAei0eP15dc0MQqT3wuB6l15Ym9NnKN16s",
    authDomain: "recipe-4b027.firebaseapp.com",
    projectId: "recipe-4b027",
    storageBucket: "recipe-4b027.appspot.com",
    messagingSenderId: "584092446949",
    appId: "1:584092446949:web:88d8e01190fe68d2e5a40c",
    measurementId: "G-5V8NR4Q1XK"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore and Storage
const db = getFirestore(app);  // Firestore instance
const storage = getStorage(app);  // Storage instance

// Export db and storage to use in other parts of your app
export { db, storage, auth};