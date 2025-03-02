import React, { useState, useRef, useEffect } from "react";

const Cell = ({
    cell,
    rowIndex,
    colIndex,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleCellClick,
    saveDataToFirebase,
    cells,
    setCells,
    selectedRange,
    cellFormatting,
    evaluateFormula
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [cellValue, setCellValue] = useState(cell);
    const inputRef = useRef(null);

    const cellId = `${rowIndex}-${colIndex}`;
    const formatting = cellFormatting[cellId] || {};

    // Initialize cell styles with center alignment
    const cellStyle = {
        fontWeight: formatting.bold ? 'bold' : 'normal',
        fontStyle: formatting.italic ? 'italic' : 'normal',
        textDecoration: formatting.underline ? 'underline' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        cursor: 'cell',
        userSelect: 'none' // Prevents text selection
    };

    const inputStyle = {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontWeight: cellStyle.fontWeight,
        fontStyle: cellStyle.fontStyle,
        textDecoration: cellStyle.textDecoration
    };

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    useEffect(() => {
        if (cell.startsWith('=')) {
            setCellValue(evaluateFormula(cell, rowIndex, colIndex));
        } else {
            setCellValue(cell);
        }
    }, [cell, evaluateFormula, rowIndex, colIndex]);

    // Single-click to edit
    const handleCellSingleClick = (e) => {
        // First handle the selection functionality
        handleCellClick(rowIndex, colIndex);

        // Then enter edit mode immediately
        setIsEditing(true);

        // Prevent propagation to avoid conflicting with selection handlers
        e.stopPropagation();
    };

    const handleInputChange = (e) => {
        setCellValue(e.target.value);
    };

    const handleInputBlur = () => {
        if (cellValue !== cell) {
            const newCells = [...cells];
            newCells[rowIndex][colIndex] = cellValue;
            setCells(newCells);
            saveDataToFirebase(newCells);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        } else if (e.key === 'Escape') {
            // Cancel editing and revert to original value
            setCellValue(cell);
            setIsEditing(false);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            e.target.blur();

            // Select next cell based on shift key
            const newColIndex = e.shiftKey ? colIndex - 1 : colIndex + 1;
            if (newColIndex >= 0 && newColIndex < cells[0].length) {
                handleCellClick(rowIndex, newColIndex);

                // Auto-enter edit mode for the next cell
                setTimeout(() => {
                    const nextCellId = `${rowIndex}-${newColIndex}`;
                    document.getElementById(nextCellId)?.click();
                }, 0);
            }
        }
    };

    return (
        <div
            id={cellId}
            className={`border border-gray-300 p-0 relative ${selectedRange.has(cellId) ? 'bg-blue-100' : ''
                }`}

            onMouseDown={(e) => {
                e.preventDefault(); // Prevent text selection
                handleCellMouseDown(rowIndex, colIndex);
            }}
            onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
            onClick={handleCellSingleClick}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={cellValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    style={inputStyle}
                    className="w-full h-full"
                />
            ) : (
                <div style={cellStyle}>{cellValue}</div>
            )}
        </div>
    );
};
export default Cell;
