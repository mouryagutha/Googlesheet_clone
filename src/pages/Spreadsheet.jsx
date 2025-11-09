import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSelection from "../hooks/useSelection";
import { saveDataToFirebase, fetchSheetData } from "../utils/firebaseUtils";
import { getColumnLabel, applyToSelection } from "../utils/spreadsheetUtils";
import Header from "../components/Header";
import Toolbar from "../components/Toolbar";
import FormulaBar from "../components/FormulaBar";
import ResultModal from "../components/ResultModal";
import Cell from "../components/Cell";
import StatusBar from "../components/StatusBar";
import ExcelJS from 'exceljs';

const SpreadsheetPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from the URL parameter
  const initialRows = 50,
    initialCols = 20;
  const [cells, setCells] = useState(
    Array.from({ length: initialRows }, () => Array(initialCols).fill(""))
  );
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
  const [clipboard, setClipboard] = useState(null);
  const {
    isSelecting,
    setIsSelecting,
    selectionStart,
    setSelectionStart,
    selectionEnd,
    setSelectionEnd,
    selectedRange,
    setSelectedRange,
  } = useSelection();

  useEffect(() => {
    fetchSheetData(id, setCells, setSheetName);
  }, [id]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isSelecting, setIsSelecting]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      if (document.activeElement.tagName === "INPUT") {
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          selectedRange.size > 0
        ) {
          if (
            document.activeElement !== document.activeElement.closest("input")
          ) {
            clearSelectedCells();
            e.preventDefault();
          }
        }
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "r":
            e.preventDefault();
            if (e.shiftKey) {
              deleteRow();
            } else {
              addRow();
            }
            break;
          case "c":
            e.preventDefault();
            if (e.shiftKey) {
              deleteColumn();
            } else {
              addColumn();
            }
            break;
          case "z":
            e.preventDefault();
            handleUndo();
            break;
          case "y":
            e.preventDefault();
            handleRedo();
            break;
          case "x":
            e.preventDefault();
            handleCopy();
            clearSelectedCells();
            break;
          case "v":
            e.preventDefault();
            handlePaste();
            break;
          default:
            break;
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        clearSelectedCells();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRange, isSelecting]);

  // Save state to history for undo/redo
  const saveToHistory = (newCells) => {
    setHistory((prev) => [...prev, JSON.stringify(cells)]);
    setRedoStack([]);
  };

  const addRow = () => {
    saveToHistory(cells);
    const newCells = [...cells, Array(cells[0].length).fill("")];
    setCells(newCells);
    saveDataToFirebase(id, newCells);
  };

  const deleteRow = () => {
    if (selectedRange.size > 0) {
      saveToHistory(cells);
      const rowsToDelete = new Set();
      [...selectedRange].forEach((cell) => {
        rowsToDelete.add(parseInt(cell.split("-")[0]));
      });
      const rowsArray = [...rowsToDelete].sort((a, b) => b - a);
      let newCells = [...cells];
      rowsArray.forEach((rowIndex) => {
        newCells = [
          ...newCells.slice(0, rowIndex),
          ...newCells.slice(rowIndex + 1),
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
    saveToHistory(cells);
    const newCells = cells.map((row) => [...row, ""]);
    setCells(newCells);
    saveDataToFirebase(id, newCells);
  };

  const deleteColumn = () => {
    if (selectedRange.size > 0) {
      saveToHistory(cells);
      const colsToDelete = new Set();
      [...selectedRange].forEach((cell) => {
        colsToDelete.add(parseInt(cell.split("-")[1]));
      });
      const colsArray = [...colsToDelete].sort((a, b) => b - a);
      let newCells = cells.map((row) => [...row]);
      colsArray.forEach((colIndex) => {
        newCells = newCells.map((row) => [
          ...row.slice(0, colIndex),
          ...row.slice(colIndex + 1),
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
    if (selectedRange.size > 0) {
      saveToHistory(cells);
      const newCells = applyToSelection(cells, selectedRange, () => "");
      setCells(newCells);
      saveDataToFirebase(id, newCells);
    }
  };

  const handleFormulaBarChange = (e) => {
    setFormulaBarValue(e.target.value);
  };

  const handleFormulaBarBlur = () => {
    if (selectedCell) {
      saveToHistory(cells);
      const [row, col] = selectedCell.split("-").map(Number);
      const newCells = [...cells];
      newCells[row][col] = formulaBarValue;
      setCells(newCells);
      saveDataToFirebase(id, newCells);
    }
  }; // In SpreadsheetPage component:
  // In your SpreadsheetPage component:

  // Update this function to explicitly pass the current sheet name
  const handleSheetNameBlur = () => {
    console.log("Saving sheet name on blur:", sheetName);
    saveDataToFirebase(id, cells, sheetName);
  };

  // Add a specific function for handling sheet name changes
  const handleSheetNameChange = (newName) => {
    console.log("Sheet name changed to:", newName);
    setSheetName(newName);
  };
  const handleCellClick = (row, col) => {
    setSelectedCell(`${row}-${col}`);
    setFormulaBarValue(cells[row][col]);
  };

  const handleCellMouseDown = (row, col) => {
    setSelectionStart({ row, col });
    setSelectionEnd({ row, col });
    setIsSelecting(true);
  };

  const handleCellMouseEnter = (row, col) => {
    if (isSelecting) {
      setSelectionEnd({ row, col });
    }
  };

  const handleCellMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      const newSelectedRange = new Set();
      for (
        let r = Math.min(selectionStart.row, selectionEnd.row);
        r <= Math.max(selectionStart.row, selectionEnd.row);
        r++
      ) {
        for (
          let c = Math.min(selectionStart.col, selectionEnd.col);
          c <= Math.max(selectionStart.col, selectionEnd.col);
          c++
        ) {
          newSelectedRange.add(`${r}-${c}`);
        }
      }
      setSelectedRange(newSelectedRange);
    }
  };

  // Helper function to get the cell adjacent to selection (next to the selected range)
  const getCellNextToSelection = () => {
    const cellsArray = Array.from(selectedRange);
    const coordinates = cellsArray.map(cellId => {
      const [row, col] = cellId.split("-").map(Number);
      return { row, col, cellId };
    });
    
    // Find the boundaries of the selection
    const minRow = Math.min(...coordinates.map(c => c.row));
    const maxRow = Math.max(...coordinates.map(c => c.row));
    const minCol = Math.min(...coordinates.map(c => c.col));
    const maxCol = Math.max(...coordinates.map(c => c.col));
    
    // Determine if selection is more horizontal or vertical
    const width = maxCol - minCol + 1;
    const height = maxRow - minRow + 1;
    
    // If selection is more horizontal (row-like), place result to the right
    // If selection is more vertical (column-like), place result below
    if (width > height) {
      // Horizontal selection - place result to the right of last column
      return { row: minRow, col: maxCol + 1 };
    } else {
      // Vertical selection - place result below last row
      return { row: maxRow + 1, col: minCol };
    }
  };

  // Function implementations for toolbar
  const applyFunction = (func) => {
    if (selectedRange.size === 0) {
      alert("Please select some cells first");
      return;
    }

    saveToHistory(cells);
    let result;
    const newCells = [...cells.map(row => [...row])];
    
    switch (func) {
      case "+": // SUM
        const sumValues = [...selectedRange].map((cellId) => {
          const [row, col] = cellId.split("-").map(Number);
          const value = Number(cells[row][col]);
          return isNaN(value) ? 0 : value;
        });
        result = sumValues.reduce((acc, val) => acc + val, 0);
        
        // Insert result in adjacent cell
        const nextCell = getCellNextToSelection();
        newCells[nextCell.row][nextCell.col] = result.toString();
        setCells(newCells);
        saveDataToFirebase(id, newCells);
        
        // Show brief notification
        setOperationResult(result.toString());
        setLastOperation("SUM");
        setShowResultModal(true);
        setTimeout(() => setShowResultModal(false), 2000);
        break;

      case "÷": // AVERAGE
        const avgValues = [...selectedRange].map((cellId) => {
          const [row, col] = cellId.split("-").map(Number);
          const value = Number(cells[row][col]);
          return isNaN(value) ? 0 : value;
        });
        result =
          avgValues.length > 0
            ? avgValues.reduce((acc, val) => acc + val, 0) / avgValues.length
            : 0;
        
        // Insert result in adjacent cell
        const nextCellAvg = getCellNextToSelection();
        newCells[nextCellAvg.row][nextCellAvg.col] = result.toFixed(2).toString();
        setCells(newCells);
        saveDataToFirebase(id, newCells);
        
        // Show brief notification
        setOperationResult(result.toFixed(2).toString());
        setLastOperation("AVERAGE");
        setShowResultModal(true);
        setTimeout(() => setShowResultModal(false), 2000);
        break;

      case "↑": // MAX
        const maxValues = [...selectedRange].map((cellId) => {
          const [row, col] = cellId.split("-").map(Number);
          const value = Number(cells[row][col]);
          return isNaN(value) ? -Infinity : value;
        });
        result = Math.max(...maxValues);
        const maxResult = result === -Infinity ? "No numeric values" : result.toString();
        
        // Insert result in adjacent cell
        const nextCellMax = getCellNextToSelection();
        newCells[nextCellMax.row][nextCellMax.col] = maxResult;
        setCells(newCells);
        saveDataToFirebase(id, newCells);
        
        // Show brief notification
        setOperationResult(maxResult);
        setLastOperation("MAX");
        setShowResultModal(true);
        setTimeout(() => setShowResultModal(false), 2000);
        break;

      case "↓": // MIN
        const minValues = [...selectedRange].map((cellId) => {
          const [row, col] = cellId.split("-").map(Number);
          const value = Number(cells[row][col]);
          return isNaN(value) ? Infinity : value;
        });
        result = Math.min(...minValues);
        const minResult = result === Infinity ? "No numeric values" : result.toString();
        
        // Insert result in adjacent cell
        const nextCellMin = getCellNextToSelection();
        newCells[nextCellMin.row][nextCellMin.col] = minResult;
        setCells(newCells);
        saveDataToFirebase(id, newCells);
        
        // Show brief notification
        setOperationResult(minResult);
        setLastOperation("MIN");
        setShowResultModal(true);
        setTimeout(() => setShowResultModal(false), 2000);
        break;

      case "#": // COUNT
        result = selectedRange.size;
        
        // Insert result in adjacent cell
        const nextCellCount = getCellNextToSelection();
        newCells[nextCellCount.row][nextCellCount.col] = result.toString();
        setCells(newCells);
        saveDataToFirebase(id, newCells);
        
        // Show brief notification
        setOperationResult(result.toString());
        setLastOperation("COUNT");
        setShowResultModal(true);
        setTimeout(() => setShowResultModal(false), 2000);
        break;

      case "TRIM":
        const newCellsTrim = [...cells.map(row => [...row])];
        [...selectedRange].forEach((cellId) => {
          const [row, col] = cellId.split("-").map(Number);
          if (typeof newCellsTrim[row][col] === "string") {
            newCellsTrim[row][col] = newCellsTrim[row][col].trim();
          }
        });
        setCells(newCellsTrim);
        saveDataToFirebase(id, newCellsTrim);
        break;

      case "UPPER":
        const newCellsUpper = [...cells.map(row => [...row])];
        [...selectedRange].forEach((cellId) => {
          const [row, col] = cellId.split("-").map(Number);
          if (typeof newCellsUpper[row][col] === "string") {
            newCellsUpper[row][col] = newCellsUpper[row][col].toUpperCase();
          }
        });
        setCells(newCellsUpper);
        saveDataToFirebase(id, newCellsUpper);
        break;

      case "LOWER":
        const newCellsLower = [...cells.map(row => [...row])];
        [...selectedRange].forEach((cellId) => {
          const [row, col] = cellId.split("-").map(Number);
          if (typeof newCellsLower[row][col] === "string") {
            newCellsLower[row][col] = newCellsLower[row][col].toLowerCase();
          }
        });
        setCells(newCellsLower);
        saveDataToFirebase(id, newCellsLower);
        break;

      case "FIND_AND_REPLACE":
        const findText = prompt("Enter text to find:");
        if (findText === null) return;

        const replaceText = prompt("Enter text to replace with:");
        if (replaceText === null) return;

        const newCellsReplace = [...cells.map(row => [...row])];
        let replaceCount = 0;

        [...selectedRange].forEach((cellId) => {
          const [row, col] = cellId.split("-").map(Number);
          if (
            typeof newCellsReplace[row][col] === "string" &&
            newCellsReplace[row][col].includes(findText)
          ) {
            newCellsReplace[row][col] = newCellsReplace[row][col].replaceAll(
              findText,
              replaceText
            );
            replaceCount++;
          }
        });

        setCells(newCellsReplace);
        saveDataToFirebase(id, newCellsReplace);
        alert(`Replaced ${replaceCount} occurrences`);
        break;

      default:
        console.log(`Function not implemented: ${func}`);
    }
  };

  const handleFormattingChange = (format) => {
    if (selectedRange.size === 0) {
      alert("Please select some cells first");
      return;
    }

    const newCellFormatting = { ...cellFormatting };

    [...selectedRange].forEach((cellId) => {
      newCellFormatting[cellId] = {
        ...(newCellFormatting[cellId] || {}),
        [format]: !(newCellFormatting[cellId] || {})[format],
      };
    });

    setCellFormatting(newCellFormatting);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prevState = history[history.length - 1];
      const newHistory = history.slice(0, -1);

      setRedoStack([...redoStack, JSON.stringify(cells)]);
      setHistory(newHistory);
      setCells(JSON.parse(prevState));
      saveDataToFirebase(id, JSON.parse(prevState));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);

      setHistory([...history, JSON.stringify(cells)]);
      setRedoStack(newRedoStack);
      setCells(JSON.parse(nextState));
      saveDataToFirebase(id, JSON.parse(nextState));
    }
  };

  const handleCopy = () => {
    if (selectedRange.size === 0) {
      alert("Please select some cells first");
      return;
    }

    const minRow = Math.min(
      ...[...selectedRange].map((cell) => parseInt(cell.split("-")[0]))
    );
    const minCol = Math.min(
      ...[...selectedRange].map((cell) => parseInt(cell.split("-")[1]))
    );
    const maxRow = Math.max(
      ...[...selectedRange].map((cell) => parseInt(cell.split("-")[0]))
    );
    const maxCol = Math.max(
      ...[...selectedRange].map((cell) => parseInt(cell.split("-")[1]))
    );

    const clipboardData = [];
    for (let r = minRow; r <= maxRow; r++) {
      const row = [];
      for (let c = minCol; c <= maxCol; c++) {
        row.push(cells[r][c]);
      }
      clipboardData.push(row);
    }

    setClipboard({
      data: clipboardData,
      rowCount: maxRow - minRow + 1,
      colCount: maxCol - minCol + 1,
    });
  };

  const handlePaste = () => {
    if (!clipboard || selectedRange.size === 0) return;

    const targetCell = [...selectedRange][0];
    const [targetRow, targetCol] = targetCell.split("-").map(Number);

    saveToHistory(cells);
    const newCells = [...cells.map((row) => [...row])];

    for (let r = 0; r < clipboard.rowCount; r++) {
      for (let c = 0; c < clipboard.colCount; c++) {
        const destRow = targetRow + r;
        const destCol = targetCol + c;

        if (destRow < newCells.length && destCol < newCells[0].length) {
          newCells[destRow][destCol] = clipboard.data[r][c];
        }
      }
    }

    setCells(newCells);
    saveDataToFirebase(id, newCells);
  };

  const outputResultToCell = () => {
    if (!selectedCell) {
      alert("Please select a cell to output the result");
      return;
    }

    saveToHistory(cells);
    const [row, col] = selectedCell.split("-").map(Number);
    const newCells = [...cells];
    newCells[row][col] = operationResult;
    setCells(newCells);
    saveDataToFirebase(id, newCells);
    setShowResultModal(false);
  };
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      // Read the file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Create a new workbook instance
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      // Get the first worksheet
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        alert("No worksheet found in the file");
        return;
      }
      
      // Convert worksheet to array format
      const jsonData = [];
      worksheet.eachRow((row, rowNumber) => {
        const rowData = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          rowData.push(cell.value !== null && cell.value !== undefined ? String(cell.value) : "");
        });
        jsonData.push(rowData);
      });
      
      // Save to history for undo functionality
      saveToHistory(cells);
      
      // Create a new cells array with the imported data
      const newCells = Array.from({ length: Math.max(jsonData.length, cells.length) }, (_, rowIndex) => {
        // If we have data for this row in the imported file
        if (rowIndex < jsonData.length) {
          const importedRow = jsonData[rowIndex];
          // Create a row that's at least as long as our current sheet
          return Array.from({ length: Math.max(importedRow.length, cells[0].length) }, (_, colIndex) => {
            // If we have data for this cell in the imported file
            if (colIndex < importedRow.length) {
              return importedRow[colIndex];
            } else {
              // Keep existing cell data if outside the imported range
              return cells[rowIndex] ? cells[rowIndex][colIndex] : "";
            }
          });
        } else {
          // Keep existing rows if outside the imported range
          return [...cells[rowIndex]];
        }
      });
      
      // Update state with new cells
      setCells(newCells);
      
      // Save to Firebase
      saveDataToFirebase(id, newCells);
      
      // Maybe update sheet name to the imported file name (optional)
      const fileName = file.name.split('.')[0];
      setSheetName(fileName);
      saveDataToFirebase(id, newCells, fileName);
      
      // Show success message
      alert(`Successfully imported data from ${file.name}`);
      
    } catch (error) {
      console.error("Error importing file:", error);
      alert("Error importing file. Please check the file format and try again.");
    }
    
    // Reset the input so the same file can be imported again if needed
    event.target.value = null;
  };
  
  // Add this function to your SpreadsheetPage component
  const handleDownload = async () => {
    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SheetFlow';
      workbook.created = new Date();
      
      // Add a worksheet
      const worksheet = workbook.addWorksheet(sheetName || 'Sheet1');
      
      // First, find the actual data boundaries to avoid exporting empty cells
      let maxRow = 0;
      let maxCol = 0;
      
      for (let r = 0; r < cells.length; r++) {
        for (let c = 0; c < cells[r].length; c++) {
          if (cells[r][c] !== "") {
            maxRow = Math.max(maxRow, r);
            maxCol = Math.max(maxCol, c);
          }
        }
      }
      
      // Add data to worksheet
      for (let r = 0; r <= maxRow; r++) {
        const row = [];
        for (let c = 0; c <= maxCol; c++) {
          const cellValue = cells[r][c];
          
          // Try to convert numeric strings to numbers
          if (/^-?\d+(\.\d+)?$/.test(cellValue)) {
            row.push(parseFloat(cellValue));
          } else {
            row.push(cellValue);
          }
        }
        worksheet.addRow(row);
      }
      
      // Generate filename
      const fileName = `${sheetName || "spreadsheet"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      
      // Write to buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log("Download successful!");
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file. Please try again.");
    }
  };
  return (
    <div className="w-full h-full flex flex-col bg-white relative">
    <Header
  handleBackButtonClick={() => navigate("/")}
  sheetName={sheetName}
  setSheetName={handleSheetNameChange}
  handleSheetNameBlur={handleSheetNameBlur}
  handleDownload={handleDownload}  // Use the actual function instead of just logging
  handleFileImport={handleFileImport}
/>
      <Toolbar
        addRow={addRow}
        deleteRow={deleteRow}
        addColumn={addColumn}
        deleteColumn={deleteColumn}
        clearSelectedCells={clearSelectedCells}
        handleFormattingChange={handleFormattingChange}
        applyFunction={applyFunction}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        handleCopy={handleCopy}
        handlePaste={handlePaste}
      />
      <FormulaBar
        formulaBarValue={formulaBarValue}
        handleFormulaBarChange={handleFormulaBarChange}
        handleFormulaBarBlur={handleFormulaBarBlur}
      />
      <div
        ref={containerRef}
        className="overflow-auto flex-grow bg-gray-50"
        onMouseUp={handleCellMouseUp}
      >
        <div
          ref={gridRef}
          className="grid"
          style={{
            gridTemplateColumns: `60px repeat(${cells[0].length}, 120px)`,
          }}
        >
          {/* Corner cell - Excel style */}
          <div className="bg-gray-200 border-r border-b border-gray-400 sticky top-0 left-0 z-20"></div>
          {/* Column headers - Excel style */}
          {Array.from({ length: cells[0].length }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="px-2 py-1 text-xs font-semibold text-center bg-gray-100 border-r border-b border-gray-300 text-gray-700 sticky top-0 z-10 hover:bg-gray-200 cursor-pointer"
              style={{ minHeight: '21px' }}
            >
              {getColumnLabel(colIndex)}
            </div>
          ))}
          {cells.map((row, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              {/* Row headers - Excel style */}
              <div className="px-2 py-1 text-xs font-semibold text-center bg-gray-100 border-r border-b border-gray-300 text-gray-700 sticky left-0 z-10 hover:bg-gray-200 cursor-pointer"
                style={{ minHeight: '21px' }}
              >
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
                  saveDataToFirebase={(newCells) =>
                    saveDataToFirebase(id, newCells || cells)
                  }
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
        outputResultToCell={outputResultToCell}
      />
      <StatusBar selectedRange={selectedRange} />
    </div>
  );
};

export default SpreadsheetPage;
// Add this import at the top of your SpreadsheetPage.js file

// Add this function to your SpreadsheetPage component
