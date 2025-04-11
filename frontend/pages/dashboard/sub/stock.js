import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Components
import Header from "@/components/section/header";
import Table from "@/components/form/table";
import Loading from "@/components/loading";

// API Functions
import { fetchStockList } from "@/libs/fetching/stock";
import useUserStore from "@/stores/user-store";

const StockList = () => {
  const { userData } = useUserStore();
  const id_store = userData?.id_store;
  const [stockList, setStockList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch stock data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchStockList(id_store);
        setStockList(data);
      } catch (error) {
        toast.error("Failed to load stock data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id_store]);

  // Table configuration
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Produk", key: "product_name" },
    { label: "Stok", key: "amount" },
  ];

  const HeaderTable = [
    {
      label: "Nama Produk",
      key: "product_name",
      render: (_, row) => (
        <b>{row.id_product?.name_product || "Produk tidak ada"}</b>
      ),
    },
    { label: "Stok", key: "amount" },
  ];

  // Filter stock list based on search query
  const filteredStockList = stockList.filter((stock) =>
    stock.id_product?.name_product
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Persediaan"
        subtitle="Detail Persediaan Produk"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearch={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredStockList.length === 0 ? (
            <h1 className="p-4 text-center text-gray-500">
              Data tidak ditemukan!
            </h1>
          ) : (
            <Table
              fileName="Daftar Persediaan"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredStockList.map((stock, index) => ({
                ...stock,
                no: index + 1,
              }))}
              itemsPerPage={10} // Pagination support
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StockList;
