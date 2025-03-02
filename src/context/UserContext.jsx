import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, provider } from "../pages/auth/firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

// Create Context
const UserContext = createContext();

// Custom Hook to use User Context
export const useUser = () => useContext(UserContext);

// Context Provider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in function
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, handleSignIn, handleSignOut }}>
      {children}
    </UserContext.Provider>
  );
};
