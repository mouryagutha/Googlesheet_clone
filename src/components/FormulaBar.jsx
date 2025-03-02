import React from "react";

const FormulaBar = ({ formulaBarValue, handleFormulaBarChange, handleFormulaBarBlur }) => {
  return (
    <div className="formula-bar border-b p-2 bg-gray-50 flex items-center">
      <span className="font-bold text-gray-600 mr-2">fx</span>
      <input
        type="text"
        value={formulaBarValue}
        onChange={handleFormulaBarChange}
        onBlur={handleFormulaBarBlur}
        className="w-full outline-none bg-transparent"
        placeholder="Enter formula or value"
      />
    </div>
  );
};

export default FormulaBar;