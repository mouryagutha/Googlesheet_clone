import React from "react";

const ResultModal = ({ showResultModal, lastOperation, operationResult, outputResultToCell, setShowResultModal }) => {
  return (
    showResultModal && (
      <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border border-gray-300 max-w-md z-50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{lastOperation === "+" ? "SUM" : 
            lastOperation === "÷" ? "AVERAGE" : 
            lastOperation === "↑" ? "MAX" : 
            lastOperation === "↓" ? "MIN" : 
            lastOperation === "#" ? "COUNT" : 
            lastOperation}</h3>
          <button 
            onClick={() => setShowResultModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="mb-3 text-gray-700">{operationResult}</div>
        <div className="flex justify-between">
          <button 
            onClick={() => {
              outputResultToCell(operationResult); // Use the function from parent
              setShowResultModal(false);
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Insert Result in Cell
          </button>
          <button 
            onClick={() => setShowResultModal(false)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    )
  );
};

export default ResultModal;
