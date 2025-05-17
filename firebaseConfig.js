// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9TKSUdY7bHFxePhe2l40hzGDDf7R4_AY",
  authDomain: "quickbite-82199.firebaseapp.com",
  projectId: "quickbite-82199",
  storageBucket: "quickbite-82199.firebasestorage.app",
  messagingSenderId: "973535046941",
  appId: "1:973535046941:web:316b5db1320a646a6d45f4",
  measurementId: "G-69FDE6NY84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };