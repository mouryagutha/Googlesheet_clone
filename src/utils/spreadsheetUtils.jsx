import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSelection from "../hooks/useSelection";
import { saveDataToFirebase, fetchSheetData } from "./firebaseUtils";
import Header from "../components/Header";
import Toolbar from "../components/Toolbar";
import FormulaBar from "../components/FormulaBar";
import ResultModal from "../components/ResultModal";
import Cell from "../components/Cell";

// spreadsheetUtils.jsx
export const getColumnLabel = (index) => {
  let label = "";
  while (index >= 0) {
    label = String.fromCharCode((index % 26) + 65) + label;
    index = Math.floor(index / 26) - 1;
  }
  return label;
};

export const applyToSelection = (cellsData, selectedRange, transformFn) => {
  const newCells = [...cellsData];
  selectedRange.forEach(cellId => {
    const [row, col] = cellId.split('-').map(Number);
    newCells[row][col] = transformFn(newCells[row][col]);
  });
  return newCells;
};

const SpreadsheetPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from the URL parameter
  const initialRows = 50, initialCols = 20;
  const [cells, setCells] = useState(Array.from({ length: initialRows }, () => Array(initialCols).fill("")));
  const [operationResult, setOperationResult] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [sheetName, setSheetName] = useState(id); // State for editable sheet name
  const [selectedCell, setSelectedCell] = useState(null); // Track the selected cell for the formula bar
  const [formulaBarValue, setFormulaBarValue] = useState(""); // Value in the formula bar
  const [cellFormatting, setCellFormatting] = useState({}); // Track cell formatting (bold, italics, etc.)
  const [lastOperation, setLastOperation] = useState("");
  const containerRef = useRef(null);
  const resultTimeoutRef = useRef(null);
  const gridRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const { isSelecting, setIsSelecting, selectionStart, setSelectionStart, selectionEnd, setSelectionEnd, selectedRange, setSelectedRange } = useSelection();

  useEffect(() => {
    fetchSheetData(id, setCells, setSheetName);
  }, [id]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isSelecting]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      if (document.activeElement.tagName === 'INPUT') {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRange.size > 0) {
          if (document.activeElement !== document.activeElement.closest('input')) {
            clearSelectedCells();
            e.preventDefault();
          }
        }
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'r':
            e.preventDefault();
            if (e.shiftKey) {
              deleteRow();
            } else {
              addRow();
            }
            break;
          case 'c':
            e.preventDefault();
            if (e.shiftKey) {
              deleteColumn();
            } else {
              addColumn();
            }
            break;
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        clearSelectedCells();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRange, isSelecting]);

  const addRow = () => {
    const newCells = [...cells, Array(cells[0].length).fill("")];
    setCells(newCells);
    saveDataToFirebase(id, newCells);
  };

  const deleteRow = () => {
    if (selectedRange.size > 0) {
      const rowsToDelete = new Set();
      [...selectedRange].forEach(cell => {
        rowsToDelete.add(parseInt(cell.split('-')[0]));
      });
      const rowsArray = [...rowsToDelete].sort((a, b) => b - a);
      let newCells = [...cells];
      rowsArray.forEach(rowIndex => {
        newCells = [
          ...newCells.slice(0, rowIndex),
          ...newCells.slice(rowIndex + 1)
        ];
      });
      if (newCells.length === 0) {
        newCells = [Array(cells[0].length).fill("")];
      }
      setCells(newCells);
      saveDataToFirebase(id, newCells);
    }
  };

  const addColumn = () => {
    const newCells = cells.map(row => [...row, ""]);
    setCells(newCells);
    saveDataToFirebase(id, newCells);
  };

  const deleteColumn = () => {
    if (selectedRange.size > 0) {
      const colsToDelete = new Set();
      [...selectedRange].forEach(cell => {
        colsToDelete.add(parseInt(cell.split('-')[1]));
      });
      const colsArray = [...colsToDelete].sort((a, b) => b - a);
      let newCells = cells.map(row => [...row]);
      colsArray.forEach(colIndex => {
        newCells = newCells.map(row => [
          ...row.slice(0, colIndex),
          ...row.slice(colIndex + 1)
        ]);
      });
      if (newCells[0].length === 0) {
        newCells = newCells.map(() => [""]);
      }
      setCells(newCells);
      saveDataToFirebase(id, newCells);
    }
  };

  const clearSelectedCells = () => {
    const newCells = applyToSelection(cells, selectedRange, () => "");
    setCells(newCells);
    saveDataToFirebase(id, newCells);
  };

  const handleFormulaBarChange = (e) => {
    setFormulaBarValue(e.target.value);
  };

  const handleFormulaBarBlur = () => {
    if (selectedCell) {
      const [row, col] = selectedCell.split('-').map(Number);
      const newCells = [...cells];
      newCells[row][col] = formulaBarValue;
      setCells(newCells);
      saveDataToFirebase(id, newCells);
    }
  };

  const handleCellClick = (row, col) => {
    setSelectedCell(`${row}-${col}`);
    setFormulaBarValue(cells[row][col]);
  };

  const handleCellMouseDown = (row, col) => {
    setSelectionStart(`${row}-${col}`);
    setSelectionEnd(`${row}-${col}`);
    setIsSelecting(true);
  };

  const handleCellMouseEnter = (row, col) => {
    if (isSelecting) {
      setSelectionEnd(`${row}-${col}`);
    }
  };

  const handleCellMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
    }
  };
const handleSheetNameBlur = () => {
    saveDataToFirebase(id, cells, sheetName);
  };


  return (
    <div className="w-full h-full flex flex-col bg-white relative">
    <Header
        handleBackButtonClick={() => navigate("/")}
        sheetName={sheetName}
        setSheetName={setSheetName}
        handleSheetNameBlur={handleSheetNameBlur}
        handleDownload={() => console.log("Download")}
      />
      <Toolbar
        addRow={addRow}
        deleteRow={deleteRow}
        addColumn={addColumn}
        deleteColumn={deleteColumn}
        clearSelectedCells={clearSelectedCells}
        handleFormattingChange={(format) => console.log(`Format: ${format}`)}
        applyFunction={(func) => console.log(`Function: ${func}`)}
        handleUndo={() => console.log("Undo")}
        handleRedo={() => console.log("Redo")}
        handleCopy={() => console.log("Copy")}
        handlePaste={() => console.log("Paste")}
      />
      <FormulaBar
        formulaBarValue={formulaBarValue}
        handleFormulaBarChange={handleFormulaBarChange}
        handleFormulaBarBlur={handleFormulaBarBlur}
      />
      <div ref={containerRef} className="overflow-auto flex-grow" onMouseUp={handleCellMouseUp}>
        <div ref={gridRef} className="grid" style={{ gridTemplateColumns: `60px repeat(${cells[0].length}, 120px)` }}>
          <div className="bg-gray-100 border border-gray-300"></div>
          {Array.from({ length: cells[0].length }).map((_, colIndex) => (
            <div key={colIndex} className="p-2 font-bold text-center bg-gray-100 border border-gray-300">
              {getColumnLabel(colIndex)}
            </div>
          ))}
          {cells.map((row, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              <div className="p-2 font-bold text-center bg-gray-100 border border-gray-300">
                {rowIndex + 1}
              </div>
              {row.map((cell, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  handleCellMouseDown={handleCellMouseDown}
                  handleCellMouseEnter={handleCellMouseEnter}
                  handleCellClick={handleCellClick}
                  saveDataToFirebase={saveDataToFirebase}
                  cells={cells}
                  setCells={setCells}
                  selectedRange={selectedRange}
                  cellFormatting={cellFormatting}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      <ResultModal
        showResultModal={showResultModal}
        setShowResultModal={setShowResultModal}
        lastOperation={lastOperation}
        operationResult={operationResult}
        outputResultToCell={() => console.log("Output Result to Cell")}
      />
    </div>
  );
};

export default SpreadsheetPage;