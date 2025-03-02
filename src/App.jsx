import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SpreadsheetPage from "./pages/Spreadsheet";
import Home from "./pages/home";


const App = () => {
  return (
    <div>
<Routes>
        {/* Home Route */}
        <Route path="/" element={<Home />} />

        {/* Spreadsheet Route */}
        <Route path="/spreadsheet/:id" element={<SpreadsheetPage/>} />

        
      </Routes>
    </div>
      
    
  );
};

export default App;
