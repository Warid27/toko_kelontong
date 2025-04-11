"use client"; // Ensure it's a client component

import { useRef } from "react";

import { saveAs } from "file-saver";
import Papa from "papaparse";
import { toast } from "react-toastify";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"; // ✅ No `* as pdfFonts`

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs; // ✅ Ensures vfs is assigned

// Component
import { AddMenu } from "@/components/form/menu";

// Icon
import { FaFilePdf } from "react-icons/fa6";
import { IoPrint } from "react-icons/io5";
import { SiGooglesheets } from "react-icons/si";

const ExportData = ({ data, columns, fileName }) => {
  // Export to CSV
  const exportToCSV = () => {
    const csvData = Papa.unparse({
      fields: columns.map((col) => col.label),
      data: data.map((row) => columns.map((col) => row[col.key])),
    });

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
    toast.success("File Excel berhasil didownload!");
  };

  // Export to PDF
  const exportToPDF = () => {
    const title = fileName;
    const columnsHeaders = columns.map((col) => col.label);
    const tableBody = data.map((row) => columns.map((col) => row[col.key]));

    // Adjust column widths dynamically
    const columnCount = columns.length;
    let widths;

    if (columnCount === 1) {
      widths = ["100%"]; // Single column takes full width
    } else if (columnCount === 2) {
      widths = ["15%", "85%"]; // "No" column smaller
    } else {
      widths = [
        "10%",
        ...Array(columnCount - 1).fill(`${90 / (columnCount - 1)}%`),
      ];
      // "No" column takes 10%, the rest share 90%
    }

    const docDefinition = {
      content: [
        { text: title, style: "title" },
        {
          table: {
            headerRows: 1,
            widths: widths, // Apply dynamic column widths
            body: [
              columnsHeaders.map((header) => ({
                text: header,
                style: "tableHeader",
              })), // Apply header styling
              ...tableBody.map((row) =>
                row.map((cell) => ({ text: cell, style: "tableCell" }))
              ),
            ],
          },
          layout: "lightHorizontalLines", // Table styling
        },
      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          alignment: "center", // Center-align headers
        },
        tableCell: {
          fontSize: 11,
          alignment: "center", // Center-align body text
        },
      },
      pageSize: "A4", // Ensure full-page scaling
      pageMargins: [40, 20, 40, 20], // Adjust margins for full width
    };

    pdfMake.createPdf(docDefinition).download(`${fileName}.pdf`);
    toast.success("File PDF berhasil didownload!");
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
            img { width: 50px; height: 50px; object-fit: cover; border-radius: 5px; }
            .image-container { display: flex; flex-direction: column; align-items: center; gap: 5px; }
            .image-url { font-size: 12px; color: #555; word-wrap: break-word; max-width: 150px; }
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
                      .map((col) => {
                        if (col.key === "avatar") {
                          let imageUrl = row[col.key];
                          return `
                            <td>
                              <div class="image-container">
                                <img src="${imageUrl}" alt="Avatar" onerror="this.src='https://placehold.co/500x500';" />
                                <span class="image-url">${imageUrl}</span>
                              </div>
                            </td>`;
                        }
                        return `<td>${row[col.key] || "-"}</td>`; // Handle null/undefined values
                      })
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
    <div className="flex gap-2 flex-row items-center">
      <AddMenu
        onClick={exportToCSV}
        content={<SiGooglesheets />}
        isActive={true}
      />
      <AddMenu onClick={exportToPDF} content={<FaFilePdf />} isActive={true} />
      <AddMenu onClick={printTable} content={<IoPrint />} isActive={true} />
    </div>
  );
};

export default ExportData;
