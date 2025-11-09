import React, { useState } from "react";
import { FaArrowLeft, FaDownload, FaUpload, FaSave, FaUndo, FaRedo, FaPrint } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

const Header = ({
  handleBackButtonClick,
  sheetName,
  setSheetName,
  handleSheetNameBlur,
  handleDownload,
  handleFileImport
}) => {
  const { user, handleSignOut } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Home");

  const handleLogout = () => {
    handleSignOut();
    navigate("/");
  };

  const tabs = ["Home", "Insert", "Formulas", "Data", "Review", "View"];

  return (
    <div className="flex flex-col bg-white border-b border-gray-300 shadow-sm">
      {/* Title Bar - Excel Style */}
      <div className="flex items-center justify-between px-3 py-1 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
        {/* Quick Access Toolbar & Logo */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="SheetFlow" className="w-7 h-7" />
          <span className="text-sm font-semibold text-green-700">SheetFlow</span>
        </div>
        
        {/* Sheet Name - Center */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            onBlur={handleSheetNameBlur}
            className="text-sm font-medium bg-transparent px-2 py-1 border-b border-gray-300 focus:border-green-600 outline-none transition-all"
            placeholder="Sheet Name"
          />
        </div>
        
        {/* User Section - Right */}
        <div className="flex items-center space-x-3">
          {user && (
            <div className="flex items-center space-x-2">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-6 h-6 rounded-full border border-gray-300"
              />
              <span className="text-xs text-gray-700">{user.displayName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Excel Ribbon Tabs */}
      <div className="flex items-center px-3 bg-white border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'text-green-700 border-b-2 border-green-600 bg-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Quick Access Toolbar with Icons */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleBackButtonClick}
            className="p-1.5 hover:bg-gray-200 rounded transition-all"
            title="Back to Home"
          >
            <FaArrowLeft className="text-gray-700" size={14} />
          </button>
          <button
            onClick={handleSheetNameBlur}
            className="p-1.5 hover:bg-gray-200 rounded transition-all"
            title="Save"
          >
            <FaSave className="text-gray-700" size={14} />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button className="p-1.5 hover:bg-gray-200 rounded transition-all" title="Print">
            <FaPrint className="text-gray-700" size={14} />
          </button>
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* File Import Button */}
          <div className="relative">
            <input
              type="file"
              id="file-import"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <button className="flex items-center px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-all">
              <FaUpload className="mr-1" size={12} />
              Import
            </button>
          </div>
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-all"
          >
            <FaDownload className="mr-1" size={12} />
            Export
          </button>
          
          {user && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
