// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWgEKmWkojksUshpl7EBIT-3nMDPG_0pI",
  authDomain: "we-ai-878ca.firebaseapp.com",
  projectId: "we-ai-878ca",
  storageBucket: "we-ai-878ca.firebasestorage.app",
  messagingSenderId: "804788410301",
  appId: "1:804788410301:web:b79e3a8b40176b22fba4d4",
  measurementId: "G-FNEM7LFY45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
