import React from "react";

const ResultModal = ({ showResultModal, lastOperation, operationResult, outputResultToCell, setShowResultModal }) => {
  return (
    showResultModal && (
      <div className="fixed top-20 right-6 bg-white shadow-lg rounded border-l-4 border-green-600 p-3 max-w-xs z-50 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-green-700 font-bold">✓</span>
            <div>
              <div className="text-xs font-medium text-gray-600">
                {lastOperation === "+" ? "SUM" : 
                  lastOperation === "÷" ? "AVERAGE" : 
                  lastOperation === "↑" ? "MAX" : 
                  lastOperation === "↓" ? "MIN" : 
                  lastOperation === "#" ? "COUNT" : 
                  lastOperation} calculated
              </div>
              <div className="text-sm font-semibold text-gray-900">Result: {operationResult}</div>
            </div>
          </div>
          <button 
            onClick={() => setShowResultModal(false)}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold transition-colors ml-4"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
    )
  );
};

export default ResultModal;
