"use client"; // Ensure it's a client component

import { useRef } from "react";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import Papa from "papaparse";

// Icon
import { FaFilePdf } from "react-icons/fa6";
import { IoPrint } from "react-icons/io5";
import { SiGooglesheets } from "react-icons/si";

const ExportData = ({ data, columns, fileName }) => {
  const tableRef = useRef(null);

  // Export to CSV
  const exportToCSV = () => {
    const csvData = Papa.unparse({
      fields: columns.map((col) => col.label),
      data: data.map((row) => columns.map((col) => row[col.key])),
    });

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const title = fileName;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Set title in center
    doc.setFontSize(16);
    const textWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - textWidth) / 2, 15);

    autoTable(doc, {
      startY: 25, // Move table below the title
      head: [columns.map((col) => col.label)],
      body: data.map((row) => columns.map((col) => row[col.key])),
      styles: { halign: "center" }, // Center align table content
    });

    doc.save(`${fileName}.pdf`);
  };

  // Print Table
  const printTable = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${fileName.replace(/_/g, " ")}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>${fileName.replace(/_/g, " ")}</h2>
          <table>
            <thead>
              <tr>
                ${columns.map((col) => `<th>${col.label}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) =>
                    `<tr>${columns
                      .map((col) => `<td>${row[col.key]}</td>`)
                      .join("")}</tr>`
                )
                .join("")}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex gap-2 mb-4">
      <button className="addBtn" onClick={exportToCSV}>
        <SiGooglesheets />
      </button>
      <button className="addBtn" onClick={exportToPDF}>
        <FaFilePdf />
      </button>
      <button className="addBtn" onClick={printTable}>
        <IoPrint />
      </button>
    </div>
  );
};

export default ExportData;
