// utils/formulaEval.js
import * as math from 'mathjs';

export const evaluateFormula = (formula, row, col, cells) => {
    try {
        // Extract cell references using regex
        const cellReferences = formula.matchAll(/([A-Z]+)([0-9]+)/g);
        let resultFormula = formula;

        for (const match of cellReferences) {
            const colRef = match[1];
            const rowRef = parseInt(match[2]) - 1; // Adjust to 0-based index

            // Convert column letter to a number
            const colNum = colRef.charCodeAt(0) - 'A'.charCodeAt(0);

            // Check if the cell reference is valid
            if (rowRef >= 0 && rowRef < cells.length && colNum >= 0 && colNum < cells[0].length) {
                const cellValue = cells[rowRef][colNum];
                resultFormula = resultFormula.replace(match[0], cellValue);
            } else {
                // Handle invalid cell references (e.g., out of bounds)
                return '#REF!';
            }
        }

        // Remove the '=' sign before evaluating
        resultFormula = resultFormula.slice(1);

        // Evaluate the formula using math.js
        const result = math.evaluate(resultFormula);
        return result;
    } catch (error) {
        console.error("Error evaluating formula:", error);
        return '#ERROR!';
    }
};
