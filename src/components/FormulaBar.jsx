import React from "react";

const FormulaBar = ({ formulaBarValue, handleFormulaBarChange, handleFormulaBarBlur }) => {
  return (
    <div className="formula-bar border-b px-3 py-1.5 bg-white flex items-center">
      {/* Function button - Excel style */}
      <button className="flex items-center px-2 py-1 hover:bg-gray-100 rounded mr-2" title="Insert Function">
        <span className="font-bold text-green-700 text-base">ƒₓ</span>
      </button>
      
      {/* Cell reference - Excel style */}
      <div className="flex items-center mr-2">
        <input
          type="text"
          value="A1"
          readOnly
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded bg-white text-center font-medium"
        />
      </div>
      
      {/* Formula input - Excel style */}
      <input
        type="text"
        value={formulaBarValue}
        onChange={handleFormulaBarChange}
        onBlur={handleFormulaBarBlur}
        className="flex-1 outline-none bg-white px-3 py-1 text-sm border border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-200 transition-all"
        placeholder="Type here or click a cell..."
      />
    </div>
  );
};

export default FormulaBar;