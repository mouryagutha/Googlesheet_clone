import React, { useState, useEffect } from "react";
import { auth, provider } from "./auth/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import { 
  loadSpreadsheets as fetchSpreadsheetsFromFirebase, 
  deleteSpreadsheetFromFirebase 
} from "../utils/firebaseUtils"; // Import the Firebase utilities
import { db } from "./auth/firebase";
import { doc, setDoc } from "firebase/firestore";

const Home = () => {
  const [user, setUser] = useState(null);
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
        loadSpreadsheets(currentUser.uid);
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, []);

  // Load spreadsheets when the user changes (or initially logs in)
  useEffect(() => {
    if (user) {
      loadSpreadsheets(user.uid);
    }
  }, [user]); // Depend on 'user'

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));
      loadSpreadsheets(result.user.uid);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setSpreadsheets([]);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const loadSpreadsheets = async (userId) => {
    setLoading(true);
    try {
      // Use the updated function that returns sheets instead of setting them directly
      const sheets = await fetchSpreadsheetsFromFirebase(userId);
      setSpreadsheets(sheets); // Now we set the sheets in the component
    } catch (error) {
      console.error("Error in loadSpreadsheets:", error);
      // Fallback to local storage if Firestore fetch fails
      const storedSheets = JSON.parse(localStorage.getItem(`sheets_${userId}`)) || [];
      setSpreadsheets(storedSheets);
    } finally {
      setLoading(false);
    }
  };

  const createNewSpreadsheet = async () => {
    try {
      const newSheet = {
        id: Date.now().toString(),
        title: `Untitled Spreadsheet ${spreadsheets.length + 1}`,
        createdAt: new Date().toLocaleString(),
      };

      // Update local state
      const updatedSheets = [newSheet, ...spreadsheets];
      setSpreadsheets(updatedSheets);
      
      // Save to localStorage as a backup
      localStorage.setItem(`sheets_${user.uid}`, JSON.stringify(updatedSheets));
      
      // Create initial empty document in Firestore
      const docRef = doc(db, "spreadsheets", newSheet.id);
      await setDoc(docRef, {
        sheetName: newSheet.title,
        data: Array.from({ length: 50 }, (_, rowIndex) => ({
          rowIndex,
          cells: Array(20).fill(""),
        })),
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      // Navigate to the new spreadsheet
      navigate(`/spreadsheet/${newSheet.id}`);
    } catch (error) {
      console.error("Error creating new spreadsheet:", error);
      alert("Failed to create a new spreadsheet. Please try again.");
    }
  };

  const deleteSpreadsheet = async (id) => {
    if (window.confirm("Are you sure you want to delete this spreadsheet?")) {
      try {
        // Update local state
        const updatedSheets = spreadsheets.filter(sheet => sheet.id !== id);
        setSpreadsheets(updatedSheets);
        
        // Update localStorage backup
        localStorage.setItem(`sheets_${user.uid}`, JSON.stringify(updatedSheets));
        
        // Delete from Firestore using our new function
        await deleteSpreadsheetFromFirebase(id);
      } catch (error) {
        console.error("Error deleting spreadsheet:", error);
        alert("Failed to delete the spreadsheet. Please try again.");
      }
    }
  };

  const startEditing = (id, title) => {
    setEditingId(id);
    setEditedTitle(title);
  };

  const saveEditedTitle = async (id) => {
    try {
      // Update local state
      const updatedSheets = spreadsheets.map(sheet =>
        sheet.id === id ? { ...sheet, title: editedTitle } : sheet
      );

      setSpreadsheets(updatedSheets);
      
      // Update localStorage backup
      localStorage.setItem(`sheets_${user.uid}`, JSON.stringify(updatedSheets));
      
      // Update title in Firestore
      const docRef = doc(db, "spreadsheets", id);
      await setDoc(docRef, { sheetName: editedTitle }, { merge: true });

      setEditingId(null); // Clear editing state
    } catch (error) {
      console.error("Error saving edited title:", error);
      alert("Failed to update the spreadsheet title. Please try again.");
    }
  };

  return (
    <div className="font-roboto h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="header border-b p-4 bg-white shadow-sm">
        <header className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="zeotap Workspace logo" className="w-6 h-6" />
            <span className="text-lg font-medium text-gray-800">Zeotap Docs</span>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center mr-4">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full mr-2 border border-gray-300"
                />
                <span className="text-sm text-gray-700">{user.displayName}</span>
              </div>
            )}
            {user ? (
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </header>
      </div>
      {/* Body */}
      <div className="body p-8 max-w-7xl mx-auto">
        {user ? (
          <>
            <div className="flex items-center mb-4">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-12 h-12 rounded-full mr-4 border-2 border-blue-500"
              />
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.displayName}</h1>
            </div>
            <button
              onClick={createNewSpreadsheet}
              className="bg-green-600 text-white px-6 py-3 rounded mb-4 hover:bg-green-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Loading..." : "➕ New Spreadsheet"}
            </button>
            <div>
              <h2 className="text-xl font-semibold mt-6 text-gray-800">Your Spreadsheets</h2>
              {loading ? (
                <p className="text-gray-600 mt-4">Loading your spreadsheets...</p>
              ) : spreadsheets.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {spreadsheets.map((sheet) => (
                    <li
                      key={sheet.id}
                      className="p-4 border rounded shadow bg-white hover:shadow-md transition-shadow flex justify-between items-center"
                    >
                      {editingId === sheet.id ? (
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onBlur={() => saveEditedTitle(sheet.id)}
                          onKeyPress={(e) => e.key === "Enter" && saveEditedTitle(sheet.id)}
                          className="font-medium outline-none border-b border-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => navigate(`/spreadsheet/${sheet.id}`)}
                          className="cursor-pointer"
                        >
                          <h3
                            className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                            onDoubleClick={() => startEditing(sheet.id, sheet.title)}
                          >
                            {sheet.title}
                          </h3>
                          <p className="text-gray-500 text-sm">Created on: {sheet.createdAt}</p>
                        </div>
                      )}
                      <button
                        onClick={() => deleteSpreadsheet(sheet.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                      >
                        ❌ Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 mt-4">No spreadsheets found.</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center bg-gradient-to-b from-blue-500 to-indigo-700 text-white py-20 px-6 rounded-lg shadow-lg">
            <h1 className="text-5xl font-extrabold drop-shadow-lg text-gray-50">Welcome to Zeotap Workspace</h1>
            <p className="text-lg mt-4 max-w-2xl mx-auto text-gray-200">
              Zeotap Workspace provides a powerful, easy-to-use spreadsheet tool for organizing and managing data efficiently.
              Whether you're tracking tasks, handling business data, or collaborating with your team, our cloud-based solution
              keeps everything secure and accessible anytime.
            </p>
            <div className="mt-8 bg-white bg-opacity-25 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-black">✨ Key Features</h3>
              <ul className="text-lg mt-3 space-y-3">
                <li className="flex items-center space-x-2 text-black">
                  <span className="text-green-300 text-xl">✔</span>
                  <span>Create, edit, and manage multiple spreadsheets effortlessly</span>
                </li>
                <li className="flex items-center space-x-2 text-black">
                  <span className="text-green-300 text-xl">✔</span>
                  <span>Secure Google authentication for easy sign-in</span>
                </li>
                <li className="flex items-center space-x-2 text-black">
                  <span className="text-green-300 text-xl">✔</span>
                  <span>Auto-save ensures data safety and reliability</span>
                </li>
                <li className="flex items-center space-x-2 text-black">
                  <span className="text-green-300 text-xl">✔</span>
                  <span>Cloud storage with Firebase for enhanced reliability</span>
                </li>
                <li className="flex items-center space-x-2 text-black">
                  <span className="text-green-300 text-xl">✔</span>
                  <span>Intuitive user-friendly design for smooth navigation</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;