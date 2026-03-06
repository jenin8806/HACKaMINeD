import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase project config — enable Email/Password and Google in Firebase Console → Authentication
const firebaseConfig = {
  apiKey: "AIzaSyBl3JuliPK5kd_RLRAG4_36ttpIyYF0nv4",
  authDomain: "hackamined-42869.firebaseapp.com",
  projectId: "hackamined-42869",
  storageBucket: "hackamined-42869.firebasestorage.app",
  messagingSenderId: "1085250492130",
  appId: "1:1085250492130:web:0d71d110994bffd539f0bb",
  measurementId: "G-JY0P8HW3MB",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
