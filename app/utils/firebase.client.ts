// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-M0AhG8V6Hm0rAGgw9yvJIZhSJhz3FOo",
  authDomain: "scopecraft-864ad.firebaseapp.com",
  projectId: "scopecraft-864ad",
  storageBucket: "scopecraft-864ad.firebasestorage.app",
  messagingSenderId: "559021360125",
  appId: "1:559021360125:web:edeb524ba4f2dcdf70cf94",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
