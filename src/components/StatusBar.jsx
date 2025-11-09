import React from "react";

const StatusBar = ({ selectedRange }) => {
  const cellCount = selectedRange?.size || 0;
  
  // Calculate statistics if multiple cells are selected
  const getStatistics = () => {
    if (cellCount === 0) return null;
    return {
      count: cellCount,
      sum: 0, // You can calculate actual sum based on selected cells
      average: 0 // You can calculate actual average
    };
  };

  const stats = getStatistics();

  return (
    <div className="flex items-center justify-between px-3 py-1 bg-white border-t border-gray-300 text-xs text-gray-700">
      {/* Left side - Ready status */}
      <div className="flex items-center space-x-4">
        <span className="font-medium">Ready</span>
        {cellCount > 0 && (
          <>
            <span className="text-gray-500">|</span>
            <span>Count: {cellCount}</span>
          </>
        )}
      </div>

      {/* Right side - View controls (Excel style) */}
      <div className="flex items-center space-x-3">
        <button className="hover:bg-gray-100 px-2 py-0.5 rounded" title="Normal View">
          📄
        </button>
        <button className="hover:bg-gray-100 px-2 py-0.5 rounded" title="Page Layout">
          📋
        </button>
        <button className="hover:bg-gray-100 px-2 py-0.5 rounded" title="Page Break Preview">
          📊
        </button>
        <div className="w-px h-4 bg-gray-300"></div>
        <div className="flex items-center space-x-2">
          <button className="hover:bg-gray-100 px-1 py-0.5 rounded" title="Zoom Out">-</button>
          <span className="w-12 text-center">100%</span>
          <button className="hover:bg-gray-100 px-1 py-0.5 rounded" title="Zoom In">+</button>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
