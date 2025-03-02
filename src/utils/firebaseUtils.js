import { db } from "../pages/auth/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

export const saveDataToFirebase = async (id, data, sheetName) => {
  // Make sure sheetName has a value
  const nameToSave = sheetName || "Untitled Sheet";
  
  const docRef = doc(db, "spreadsheets", id);
  
  // Convert rows into an object (Firestore does not allow nested arrays)
  const formattedData = data.map((row, index) => ({
    rowIndex: index,
    cells: [...row],
  }));
  
  await setDoc(docRef, { 
    data: formattedData, 
    sheetName: nameToSave 
  });
}; 

// Modified function to return the sheets rather than setting them directly
export const loadSpreadsheets = async (userId) => {
  try {
    // First, get the IDs from local storage
    const storedSheets = JSON.parse(localStorage.getItem(`sheets_${userId}`)) || [];
    
    // Create a new array to hold the updated spreadsheet data
    const updatedSheets = [];
    
    // Fetch each spreadsheet's metadata from Firestore
    for (const sheet of storedSheets) {
      try {
        const docRef = doc(db, "spreadsheets", sheet.id.toString());
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const { sheetName } = docSnap.data();
          // Update the sheet with the name from Firestore
          updatedSheets.push({
            ...sheet,
            title: sheetName || sheet.title // Fallback to local title if no sheetName in Firestore
          });
        } else {
          // If the document doesn't exist in Firestore yet, keep the local data
          updatedSheets.push(sheet);
        }
      } catch (err) {
        console.error(`Error fetching sheet ${sheet.id}:`, err);
        // If there's an error, keep the local data
        updatedSheets.push(sheet);
      }
    }
    
    console.log("Updated sheets from Firestore:", updatedSheets);
    return updatedSheets; // Return the sheets instead of trying to use setSpreadsheets
  } catch (error) {
    console.error("Error loading spreadsheets:", error);
    // Fallback to local storage if Firestore fetch fails
    const storedSheets = JSON.parse(localStorage.getItem(`sheets_${userId}`)) || [];
    return storedSheets; // Return the fallback sheets
  }
};

export const fetchSheetData = async (id, setCells, setSheetName) => {
  const docRef = doc(db, "spreadsheets", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const { data, sheetName } = docSnap.data();
    
    const formattedData = data.map(row => row.cells);
    setCells(formattedData);
    
    // Only set the sheetName if it exists and is not an empty string
    if (sheetName) {
      setSheetName(sheetName);
    } else {
      // If no sheetName in the document, set a default
      setSheetName("Untitled Sheet");
    }
  } else {
    console.log("No such document!");
    // For new documents, set the default name
    setSheetName("Untitled Sheet");
    
    // You might want to initialize the document with the default name
    // This ensures a new document starts with "Untitled Sheet"
    saveDataToFirebase(id, Array.from({ length: 50 }, () => Array(20).fill("")), "Untitled Sheet");
  }
};

// Add a function to delete a spreadsheet from Firestore
export const deleteSpreadsheetFromFirebase = async (id) => {
  try {
    await deleteDoc(doc(db, "spreadsheets", id));
    console.log("Document successfully deleted from Firestore:", id);
    return true;
  } catch (error) {
    console.error("Error deleting document from Firestore:", error);
    throw error;
  }
};