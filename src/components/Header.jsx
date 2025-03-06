import React from "react";
import { FaArrowLeft, FaDownload, FaUpload } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Header = ({
  handleBackButtonClick,
  sheetName,
  setSheetName,
  handleSheetNameBlur,
  handleDownload,
  handleFileImport
}) => {
  const { user, handleSignOut } = useUser(); // Get user details from context
  const navigate = useNavigate(); // Initialize navigation

  const handleLogout = () => {
    handleSignOut(); // Sign out user
    navigate("/"); // Redirect to home page
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
      {/* Left Section */}
      <div className="flex items-center">
        <button
          onClick={handleBackButtonClick}
          className="p-2 mr-2 rounded hover:bg-gray-100"
        >
          <FaArrowLeft />
        </button>
        
        {/* Show Google Profile Picture as Logo */}
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="User"
            className="w-8 h-8 rounded-full mr-3"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 mr-3 flex items-center justify-center text-white">
            {user?.displayName?.charAt(0) || "G"}
          </div>
        )}
        
        <input
          type="text"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
          onBlur={handleSheetNameBlur}
          className="text-lg font-bold bg-transparent outline-none border-b border-gray-500"
        />
        <button
          onClick={() => {
            console.log("Manual save of sheet name:", sheetName);
            handleSheetNameBlur();
          }}
          className="ml-2 p-1 bg-blue-500 text-white text-sm rounded"
        >
          Save Name
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center">
        {/* File Import Button */}
        <div className="relative mr-4">
          <input
            type="file"
            id="file-import"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button className="flex items-center px-3 py-2 bg-green-500 text-white rounded">
            <FaUpload className="mr-2" />
            Import
          </button>
        </div>
        
        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded mr-4"
        >
          <FaDownload className="mr-2" />
          Download
        </button>
        
        {/* Show user name and logout button */}
        {user ? (
          <div className="flex items-center">
            <span className="mr-2">{user.displayName}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <span>Guest</span>
        )}
      </div>
    </div>
  );
};

export default Header;
