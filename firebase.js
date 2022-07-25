import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBn8ko-bMUEMS02wyyZpMtO9mHsL_FLxOk",
  authDomain: "amzn-next-c2bfb.firebaseapp.com",
  projectId: "amzn-next-c2bfb",
  storageBucket: "amzn-next-c2bfb.appspot.com",
  messagingSenderId: "156403893945",
  appId: "1:156403893945:web:eb3669d78de8207c44bd68",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
