import { useState, useEffect } from "react";

const useSelection = () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [selectedRange, setSelectedRange] = useState(new Set());

  useEffect(() => {
    if (selectionStart && selectionEnd) {
      updateSelectedRange(selectionStart, selectionEnd);
    }
  }, [selectionStart, selectionEnd]);

  const updateSelectedRange = (start, end) => {
    // start and end are objects with row and col properties
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    
    const newSelectedRange = new Set();
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        newSelectedRange.add(`${row}-${col}`);
      }
    }
    
    setSelectedRange(newSelectedRange);
  };

  return {
    isSelecting,
    setIsSelecting,
    selectionStart,
    setSelectionStart,
    selectionEnd,
    setSelectionEnd,
    selectedRange,
    setSelectedRange,
  };
};

export default useSelection;