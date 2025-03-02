import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, getDoc, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCY7rfDNxr-gBBrT4GLOlaMFE0wBg7xTvs",
  authDomain: "sheetclone-b4f59.firebaseapp.com",
  projectId: "sheetclone-b4f59",
  storageBucket: "sheetclone-b4f59.appspot.com",
  messagingSenderId: "1097872458634",
  appId: "1:1097872458634:web:xxxxxxxxxxxxxx",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider ,getDoc, setDoc, doc  ,db, collection};
