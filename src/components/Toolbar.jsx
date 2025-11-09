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
    <div className="toolbar border-b px-4 py-2 bg-white flex space-x-6 items-center flex-wrap shadow-sm">
      {/* Clipboard Group - Excel Style */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1">Clipboard</span>
        <div className="flex items-center space-x-1">
          <button onClick={handleCopy} className="flex flex-col items-center p-2 hover:bg-gray-100 rounded" title="Copy">
            <span className="text-base">📋</span>
            <span className="text-xs">Copy</span>
          </button>
          <button onClick={handlePaste} className="flex flex-col items-center p-2 hover:bg-gray-100 rounded" title="Paste">
            <span className="text-base">📄</span>
            <span className="text-xs">Paste</span>
          </button>
        </div>
      </div>
      
      <div className="w-px h-14 bg-gray-300"></div>

      {/* Font Group - Excel Style */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1">Font</span>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => handleFormattingChange("bold")} 
            className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all font-bold"
            title="Bold"
          >
            B
          </button>
          <button 
            onClick={() => handleFormattingChange("italic")} 
            className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all italic"
            title="Italic"
          >
            I
          </button>
          <button 
            onClick={() => handleFormattingChange("underline")} 
            className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all underline"
            title="Underline"
          >
            U
          </button>
        </div>
      </div>
      
      <div className="w-px h-14 bg-gray-300"></div>

      {/* Cells Group - Excel Style */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1">Cells</span>
        <div className="flex items-center space-x-1">
          <button 
            onClick={addRow} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all flex items-center text-xs"
            title="Insert Row"
          >
            <FaPlus className="mr-1" size={10} /> Row
          </button>
          <button 
            onClick={addColumn} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all flex items-center text-xs"
            title="Insert Column"
          >
            <FaPlus className="mr-1" size={10} /> Col
          </button>
          <button 
            onClick={deleteRow} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all flex items-center text-xs"
            title="Delete Row"
          >
            <FaTrash className="mr-1" size={10} /> Row
          </button>
          <button 
            onClick={deleteColumn} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all flex items-center text-xs"
            title="Delete Column"
          >
            <FaTrash className="mr-1" size={10} /> Col
          </button>
        </div>
      </div>
      
      <div className="w-px h-14 bg-gray-300"></div>
      
      {/* Functions Group - Excel Style */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1">Functions</span>
        <select 
          onChange={(e) => applyFunction(e.target.value)} 
          value=""
          className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 focus:border-green-600 focus:ring-1 focus:ring-green-200 transition-all cursor-pointer bg-white text-sm"
        >
          <option value="">Select Function...</option>
          <option value="+">∑ SUM</option>
          <option value="÷">AVG AVERAGE</option>
          <option value="↑">MAX</option>
          <option value="↓">MIN</option>
          <option value="#">COUNT</option>
          <option value="TRIM">TRIM</option>
          <option value="UPPER">UPPER</option>
          <option value="LOWER">LOWER</option>
          <option value="FIND_AND_REPLACE">FIND & REPLACE</option>
        </select>
      </div>

      {/* Edit Menu */}
      <div className="border-l border-gray-300 pl-3">
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button 
            className="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            onClick={() => setIsEditDropdownOpen(!isEditDropdownOpen)}
          >
            <FaEdit className="mr-2" size={14} /> Edit
          </button>
          {isEditDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button 
                  onClick={() => { handleUndo(); setIsEditDropdownOpen(false); }} 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 w-full text-left transition-colors"
                >
                  ↩️ Undo
                </button>
                <button 
                  onClick={() => { handleRedo(); setIsEditDropdownOpen(false); }} 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 w-full text-left transition-colors"
                >
                  ↪️ Redo
                </button>
                <button 
                  onClick={() => { handleCopy(); setIsEditDropdownOpen(false); }} 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 w-full text-left transition-colors"
                >
                  📋 Copy
                </button>
                <button 
                  onClick={() => { handlePaste(); setIsEditDropdownOpen(false); }} 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 w-full text-left transition-colors"
                >
                  📄 Paste
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;