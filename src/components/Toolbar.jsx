import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";

const Toolbar = ({ applyFunction, handleFormattingChange, addRow, deleteRow, addColumn, deleteColumn, clearSelectedCells, handleUndo, handleRedo, handleCopy, handlePaste }) => {
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsEditDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="toolbar border-b p-2 bg-gray-50 flex space-x-2 items-center flex-wrap">
      <div className="mr-2">
        <select 
          onChange={(e) => applyFunction(e.target.value)} 
          value=""
          className="px-2 py-1 border rounded"
        >
          <option value="">Functions</option>
          <option value="+">+ (SUM)</option>
          <option value="÷">÷ (AVERAGE)</option>
          <option value="↑">↑ (MAX)</option>
          <option value="↓">↓ (MIN)</option>
          <option value="#"># (COUNT)</option>
          <option value="TRIM">TRIM</option>
          <option value="UPPER">UPPERCASE</option>
          <option value="LOWER">LOWERCASE</option>
          <option value="FIND_AND_REPLACE">FIND & REPLACE</option>
        </select>
      </div>
      <div className="border-l pl-2 mr-2">
        <button onClick={() => handleFormattingChange("bold")} className="px-2 py-1 border rounded">
          <strong>B</strong>
        </button>
        <button onClick={() => handleFormattingChange("italic")} className="px-2 py-1 border rounded ml-1">
          <em>I</em>
        </button>
        <button onClick={() => handleFormattingChange("underline")} className="px-2 py-1 border rounded ml-1">
          <u>U</u>
        </button>
      </div>
      <div className="border-l flex pl-2">
        <button onClick={addRow} className="px-2 py-1 border rounded bg-green-100 flex items-center">
          <FaPlus className="mr-1" size={12} /> Row
        </button>
        <button onClick={deleteRow} className="px-2 py-1 border rounded ml-1 bg-red-100 flex items-center">
          <FaTrash className="mr-1" size={12} /> Row
        </button>
        <button onClick={addColumn} className="px-2 py-1 border rounded ml-1 bg-green-100 flex items-center">
          <FaPlus className="mr-1" size={12} /> Col
        </button>
        <button onClick={deleteColumn} className="px-2 py-1 border rounded ml-1 bg-red-100 flex items-center">
          <FaTrash className="mr-1" size={12} /> Col
        </button>
        <button onClick={clearSelectedCells} className="px-2 py-1 border rounded ml-1 bg-gray-200 flex items-center">
          <FaTrash className="mr-1" size={12} /> Clear
        </button>
      </div>
      <div className="border-l pl-2 mr-2">
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button 
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            onClick={() => setIsEditDropdownOpen(!isEditDropdownOpen)}
          >
            <FaEdit className="mr-1" size={12} /> Edit
          </button>
          {isEditDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button onClick={() => { handleUndo(); setIsEditDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Undo</button>
                <button onClick={() => { handleRedo(); setIsEditDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Redo</button>
                <button onClick={() => { handleCopy(); setIsEditDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Copy</button>
                <button onClick={() => { handlePaste(); setIsEditDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Paste</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;