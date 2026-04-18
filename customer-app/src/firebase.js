import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration template (Replace values with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBYDi8zmqlXEqpDoa6HggizEqdmJmrdiqA",
  authDomain: "supercart-customer-app.firebaseapp.com",
  projectId: "supercart-customer-app",
  storageBucket: "supercart-customer-app.firebasestorage.app",
  messagingSenderId: "444825466346",
  appId: "1:444825466346:android:4f90a6fc1901c3f493ee93"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };
