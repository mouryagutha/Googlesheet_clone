import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

const Toolbar = ({ applyFunction, handleFormattingChange, addRow, deleteRow, addColumn, deleteColumn, clearSelectedCells, handleUndo, handleRedo, handleCopy, handlePaste, handleAlignment, handleTextColor, handleBackgroundColor, handleMergeCells, handleClearFormat, handleFillDown, handleFillRight }) => {

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

      {/* Alignment Group - Excel Style */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1">Alignment</span>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => handleAlignment && handleAlignment("left")} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all text-xs"
            title="Align Left"
          >
            ≡
          </button>
          <button 
            onClick={() => handleAlignment && handleAlignment("center")} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all text-xs"
            title="Align Center"
          >
            ≣
          </button>
          <button 
            onClick={() => handleAlignment && handleAlignment("right")} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all text-xs"
            title="Align Right"
          >
            ≡̅
          </button>
        </div>
      </div>
      
      <div className="w-px h-14 bg-gray-300"></div>

      {/* Format Group - Colors & Clear */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1">Format</span>
        <div className="flex items-center space-x-1">
          <div className="relative">
            <input 
              type="color" 
              onChange={(e) => handleTextColor && handleTextColor(e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              title="Text Color"
            />
            <span className="absolute bottom-0 left-0 text-xs pointer-events-none">A</span>
          </div>
          <div className="relative">
            <input 
              type="color" 
              onChange={(e) => handleBackgroundColor && handleBackgroundColor(e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              title="Background Color"
            />
            <span className="absolute bottom-0 left-0 text-xs pointer-events-none">🎨</span>
          </div>
          <button 
            onClick={() => handleClearFormat && handleClearFormat()} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all text-xs"
            title="Clear Format"
          >
            🧹
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
          <button 
            onClick={() => handleMergeCells && handleMergeCells()} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all flex items-center text-xs"
            title="Merge Cells"
          >
            ⊞
          </button>
          <button 
            onClick={() => handleFillDown && handleFillDown()} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all flex items-center text-xs"
            title="Fill Down"
          >
            ↓
          </button>
          <button 
            onClick={() => handleFillRight && handleFillRight()} 
            className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-all flex items-center text-xs"
            title="Fill Right"
          >
            →
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
      
      <div className="w-px h-14 bg-gray-300"></div>

      {/* Editing Group - Undo/Redo */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1">Editing</span>
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleUndo} 
            className="flex flex-col items-center p-2 hover:bg-gray-100 rounded transition-all" 
            title="Undo"
          >
            <span className="text-base">↩️</span>
            <span className="text-xs">Undo</span>
          </button>
          <button 
            onClick={handleRedo} 
            className="flex flex-col items-center p-2 hover:bg-gray-100 rounded transition-all" 
            title="Redo"
          >
            <span className="text-base">↪️</span>
            <span className="text-xs">Redo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;