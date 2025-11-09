import React, { useState, useEffect } from "react";
import { auth, provider } from "./auth/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
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
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <img 
                src={logo} 
                alt="SheetFlow Workspace logo" 
                className="w-10 h-10 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-md" 
              />
              <div className="absolute -inset-1 bg-green-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
                SheetFlow
              </span>
              <span className="text-xs text-gray-500 -mt-1">Excel-Style Workspace</span>
            </div>
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
                className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </header>
      </div>
      {/* Body */}
      <div className="body p-8 max-w-7xl mx-auto">
        {user ? (
          <>
            {/* Hero Welcome Section */}
            <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Welcome back, {user.displayName?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-green-100 text-lg">Ready to create something amazing?</p>
                  </div>
                </div>
                <button
                  onClick={createNewSpreadsheet}
                  className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                  disabled={loading}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{loading ? "Creating..." : "New Spreadsheet"}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Spreadsheets</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{spreadsheets.length}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Last Created</p>
                    <h3 className="text-lg font-bold text-gray-800 mt-1">
                      {spreadsheets.length > 0 ? 'Today' : 'None'}
                    </h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Storage Status</p>
                    <h3 className="text-lg font-bold text-gray-800 mt-1">Cloud Synced</h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Spreadsheets Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Spreadsheets</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span>List View</span>
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : spreadsheets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spreadsheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-green-500 transform hover:-translate-y-1"
                    >
                      {editingId === sheet.id ? (
                        <div className="p-6">
                          <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onBlur={() => saveEditedTitle(sheet.id)}
                            onKeyPress={(e) => e.key === "Enter" && saveEditedTitle(sheet.id)}
                            className="w-full font-semibold text-lg outline-none border-b-2 border-green-500 pb-2"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={() => navigate(`/spreadsheet/${sheet.id}`)}
                            className="cursor-pointer p-6"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(sheet.id, sheet.title);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            </div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                              {sheet.title}
                            </h3>
                            <p className="text-gray-500 text-sm flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {sheet.createdAt}
                            </p>
                          </div>
                          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/spreadsheet/${sheet.id}`);
                              }}
                              className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
                            >
                              <span>Open</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSpreadsheet(sheet.id);
                              }}
                              className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                  <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No spreadsheets yet</h3>
                  <p className="text-gray-600 mb-6">Create your first spreadsheet to get started</p>
                  <button
                    onClick={createNewSpreadsheet}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Spreadsheet</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="min-h-[80vh]">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-900 rounded-3xl overflow-hidden shadow-2xl mb-12">
              {/* Animated Background Circles */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl -ml-40 -mb-40 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="relative z-10 text-center py-24 px-6">
                <div className="inline-block mb-6">
                  <img src={logo} alt="SheetFlow" className="w-24 h-24 mx-auto drop-shadow-2xl animate-bounce" />
                </div>
                <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
                  Welcome to <span className="bg-gradient-to-r from-yellow-200 to-green-200 bg-clip-text text-transparent">SheetFlow</span>
                </h1>
                <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-8 leading-relaxed">
                  Your powerful Excel-style spreadsheet workspace in the cloud. Create, collaborate, and manage data with ease.
                </p>
                <button
                  onClick={handleSignIn}
                  className="group bg-white text-green-700 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-green-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 inline-flex items-center space-x-3"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Get Started with Google</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Why Choose SheetFlow?</h2>
              <p className="text-center text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
                Experience the perfect blend of power and simplicity with our Excel-style cloud spreadsheet
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-2">
                  <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Excel-Style Interface</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Familiar Excel design with ribbon tabs, formulas, and advanced functions for seamless productivity
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-2">
                  <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Secure Authentication</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Google OAuth integration ensures your data is protected with enterprise-grade security
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 transform hover:-translate-y-2">
                  <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Cloud Storage</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Auto-save to Firebase Cloud keeps your work safe and accessible from anywhere, anytime
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-yellow-500 transform hover:-translate-y-2">
                  <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-200 transition-colors">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Real-Time Updates</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Changes sync instantly across devices with automatic save and real-time collaboration
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-red-500 transform hover:-translate-y-2">
                  <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Advanced Functions</h3>
                  <p className="text-gray-600 leading-relaxed">
                    SUM, AVERAGE, MAX, MIN, COUNT and more - all your favorite Excel functions included
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500 transform hover:-translate-y-2">
                  <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-200 transition-colors">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Intuitive Design</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Beautiful, user-friendly interface that makes data management effortless and enjoyable
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-3xl p-12 text-center shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users managing their data smarter with SheetFlow
              </p>
              <button
                onClick={handleSignIn}
                className="bg-white text-green-700 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-green-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center space-x-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google - It's Free!</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;