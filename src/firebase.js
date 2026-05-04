import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAxRSoDx-6dhYNXualkdBWYh7YOj0yxWXo",
    authDomain: "submitsafe.firebaseapp.com",
    projectId: "submitsafe",
    storageBucket: "submitsafe.firebasestorage.app",
    messagingSenderId: "112646698103",
    appId: "1:112646698103:web:862364ba8cec94c4d28272"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);