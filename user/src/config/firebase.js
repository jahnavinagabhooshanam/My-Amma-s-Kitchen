import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyACjetRO60czv3IGwZdWlOmgBHXrG7w7UE",
  authDomain: "amma-s-kitchen-f3fca.firebaseapp.com",
  projectId: "amma-s-kitchen-f3fca",
  storageBucket: "amma-s-kitchen-f3fca.firebasestorage.app",
  messagingSenderId: "302905219064",
  appId: "1:302905219064:web:00f11442710bd1f236e80d",
  measurementId: "G-7T38RX7TQW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Authentication exports
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export default app;
