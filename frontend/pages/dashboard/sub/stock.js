import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import { fetchStockList } from "@/libs/fetching/stock";

const StockList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stockList, setStockList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10; // Tampilkan 10 item per halaman
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStockData = async () => {
      
      const data_stock = await fetchStockList();
      setStockList(data_stock);
      setIsLoading(false);
    };
    fetchStockData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const filteredStockList = stockList.filter((stock) =>
    stock.id_product?.name_product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hitung data yang akan ditampilkan berdasarkan halaman
  const startIndex = currentPage * itemsPerPage;
  const selectedData = filteredStockList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full h-screen pt-16">
      <div className="p-4 bg-white shadow-lg">
        <p className="text-2xl font-bold">Daftar Persediaan</p>

        <div className="relative mt-4">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs bg-white"
          />
          <IoSearchOutline className="absolute left-2 top-2.5 text-xl text-gray-500" />
        </div>
      </div>

      <div className="p-4 mt-4 bg-white rounded-lg">
        <div>
          {filteredStockList.length === 0 ? (
            <h1 className="text-center text-gray-500">Data tidak ditemukan!</h1>
          ) : (
            <>
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Produk</th>
                    <th>Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.map((stock, index) => (
                    <tr key={stock._id}>
                      <td>{startIndex + index + 1}</td>
                      <td><b>{stock.id_product?.name_product || "Produk tidak ada"}</b></td>
                      <td>{stock.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ReactPaginate
                previousLabel={"← Prev"}
                nextLabel={"Next →"}
                pageCount={Math.ceil(stockList.length / itemsPerPage)}
                onPageChange={({ selected }) => setCurrentPage(selected)}
                containerClassName={"flex gap-2 justify-center mt-4"}
                pageLinkClassName={"border px-3 py-1"}
                previousLinkClassName={"border px-3 py-1"}
                nextLinkClassName={"border px-3 py-1"}
                activeClassName={"bg-blue-500 text-white"}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockList;
