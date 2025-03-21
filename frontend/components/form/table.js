import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ExportData from "@/components/ExportData";
import PaginationComponent from "@/components/form/pagination";

const Table = ({
  columns,
  data,
  actions,
  ExportHeaderTable,
  statusOptions = null,
  ruleList = null,
  fileName = "DATA",
}) => {
  const [itemsPerPage, setItemsPerPage] = useState(10); // State for items per page
  const [currentPage, setCurrentPage] = useState(0);
  const startIndex = currentPage * itemsPerPage;

  // Reset currentPage when data changes
  useEffect(() => {
    if (data.length > 0) {
      setCurrentPage((prevPage) => {
        const maxPage = Math.ceil(data.length / itemsPerPage) - 1;
        return prevPage > maxPage ? maxPage : prevPage;
      });
    }
  }, [data, itemsPerPage]);

  const selectedData = data.slice(startIndex, startIndex + itemsPerPage);
  console.log("EXPORT HEADER TABLE", ExportHeaderTable);
  // Generate export data dynamically based on columns
  const dataForExport = selectedData.map((row, index) => ({
    no: index + 1,
    ...Object.fromEntries(
      columns.map((col) => [
        col.key,
        col.key === "status"
          ? statusOptions?.find((opt) => opt.value === row[col.key])?.label ||
            "Unknown"
          : col.key === "rule"
          ? ruleList?.find((opt) => opt.value === row[col.key])?.label || "-"
          : col.key === "avatar" || col.key === "image"
          ? row[col.key]
          : col.render
          ? col.render(row[col.key], row)
          : row[col.key],
      ])
    ),
  }));
  console.log("DATA FOR EXPORT", dataForExport);
  return (
    <>
      <div className="p-5 flex flex-row justify-between items-center">
        <h1 className="flex flex-row gap-3 items-center">
          <span>Export To:</span>
          <ExportData
            data={dataForExport}
            columns={ExportHeaderTable}
            fileName={fileName}
          />
        </h1>
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage">Rows per page:</label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border p-1 rounded bg-white cursor-pointer"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className=" shadow-lg rounded-lg"
        role="table"
      >
        <table className="table w-full border border-gray-300 rounded-lg overflow-hidden">
          {/* Table Header */}
          <thead>
            <tr className="bg-gradient-to-r from-green-500 to-green-700 text-white">
              <th className="p-3 text-center">No</th>{" "}
              {/* Tambahkan kolom nomor */}
              {columns.map((col, index) => (
                <th key={index} className={`p-3 ${col.align || "text-center"}`}>
                  {col.label}
                </th>
              ))}
              {actions && <th className="p-3 text-center">Aksi</th>}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {selectedData.length > 0 ? (
              selectedData.map((row, rowIndex) => (
                <motion.tr
                  key={row.id || row._id || rowIndex}
                  whileHover={{ scale: 1.02 }}
                  className="hover:bg-green-100 transition duration-300"
                >
                  <td className="p-3 text-center">
                    {startIndex + rowIndex + 1}
                  </td>{" "}
                  {/* Tambahkan nomor urut */}
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-3 ${col.align || "text-center"}`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-3 flex justify-center gap-2">
                      {actions.map((action, actionIndex) => (
                        <motion.button
                          key={actionIndex}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => action.onClick(row)}
                          className={`p-2 rounded-full text-white shadow-md transition ${action.className}`}
                        >
                          {action.icon}
                        </motion.button>
                      ))}
                    </td>
                  )}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 2 : 1)}
                  className="text-center p-5 text-gray-500"
                >
                  Tidak ada data tersedia.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <PaginationComponent
          totalItems={data.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </motion.div>
    </>
  );
};

export default Table;
