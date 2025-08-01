// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
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

// Sign out function
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await createUserDocument(user);
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Create or update user document
export const createUserDocument = async (user: User | null) => {
  if (!user) return null;

  const userRef = doc(db, "users", user.uid);

  try {
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user document
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        hourlyRate: 100, // Default hourly rate
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, userData);
      console.log("User document created for:", user.email);
    } else {
      // Update existing user document with latest info
      const updateData = {
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, updateData, { merge: true });
      console.log("User document updated for:", user.email);
    }

    return userRef;
  } catch (error) {
    console.error("Error creating/updating user document:", error);
    throw error;
  }
};

// Update user's hourly rate
export const updateUserHourlyRate = async (
  user: User | null,
  hourlyRate: number
) => {
  if (!user) return null;

  const userRef = doc(db, "users", user.uid);

  try {
    const updateData = {
      hourlyRate,
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, updateData, { merge: true });
    console.log("Hourly rate updated for:", user.email, "to", hourlyRate);
    return userRef;
  } catch (error) {
    console.error("Error updating hourly rate:", error);
    throw error;
  }
};

// Get user's settings including hourly rate
export const getUserSettings = async (user: User | null) => {
  if (!user) return null;

  const userRef = doc(db, "users", user.uid);

  try {
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        hourlyRate: userData.hourlyRate || 100, // Default to 100 if not set
        ...userData,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting user settings:", error);
    throw error;
  }
};
