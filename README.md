Zeotap Doc - Google Sheets Clone

Zeotap Doc is a Google Sheets clone built using modern web technologies. This project allows users to create, edit, and store spreadsheet data securely using Firebase for storage and authentication via Google login.

📌 About the Project

Zeotap Doc aims to provide a seamless spreadsheet experience similar to Google Sheets. It includes essential spreadsheet functionalities such as data entry, formula evaluation, formatting, and data quality functions. Users can log in using Google authentication and store their data securely with Firebase.

🛠️ Tools, Technologies, and Frameworks Used

Frontend: React.js, JavaScript, Tailwind CSS

Backend & Storage: Firebase

Authentication: Google OAuth via @react-oauth/google

Libraries:

xlsx - Handling spreadsheet data

react-router-dom - Navigation

react-icons - Icons support

eslint - Code linting

📋 Features

1. Spreadsheet Interface

Mimic Google Sheets UI: Strives for a visual design and layout that closely resembles Google Sheets, including the toolbar, formula bar, and cell structure.

Drag Functions: Implements drag functionality for cell content, formulas, and selections to mirror Google Sheets' behavior.

Cell Dependencies: Ensures that formulas and functions accurately reflect cell dependencies and update accordingly when changes are made to related cells.

Cell Formatting: Supports basic formatting options such as bold, italics, font size, and color.

Row & Column Management: Allows users to add, delete, and resize rows and columns.

2. Mathematical Functions

Zeotap Doc includes the following built-in mathematical functions:

SUM: Calculates the sum of a range of cells.

AVERAGE: Calculates the average of a range of cells.

MAX: Returns the maximum value from a range of cells.

MIN: Returns the minimum value from a range of cells.

COUNT: Counts the number of cells containing numerical values in a range.

3. Data Quality Functions

To improve data integrity, the following functions are implemented:

TRIM: Removes leading and trailing whitespace from a cell.

UPPER: Converts the text in a cell to uppercase.

LOWER: Converts the text in a cell to lowercase.

REMOVE_DUPLICATES: Removes duplicate rows from a selected range.

FIND_AND_REPLACE: Allows users to find and replace specific text within a range of cells.