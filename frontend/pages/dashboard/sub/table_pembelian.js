import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Components
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Table from "@/components/form/table";
import Loading from "@/components/loading";

import { FaInfoCircle } from "react-icons/fa";

// API Functions
import { fetchPembelianList } from "@/libs/fetching/pembelian";
import { fetchTableList } from "@/libs/fetching/table";
import useUserStore from "@/stores/user-store";

const PembelianList = () => {
  const [listPembelian, setListPembelian] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [pembelianToUpdate, setPembelianToUpdate] = useState(null);

  const { userData } = useUserStore();
  const id_store = userData?.id_store;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pembelianData, tableData] = await Promise.all([
          fetchPembelianList(id_store),
          fetchTableList(),
        ]);
        setListPembelian(pembelianData);
        setTableList(tableData);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id_store]);

  // Modal control
  const modalOpen = (type, bool) => {
    if (type === "info") setIsInfoModalOpen(bool);
  };

  // Handle info details
  const handleInfoDetails = (pembelian) => {
    setPembelianToUpdate(pembelian);
    modalOpen("info", true);
  };

  // Table configuration
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "No Pembelian", key: "no" },
    { label: "Jumlah Barang", key: "total_number_item" },
    { label: "Total Harga", key: "total_price" },
    { label: "Total Kuantitas", key: "total_quantity" },
    { label: "Status", key: "status" },
  ];

  const HeaderTable = [
    { label: "No Pembelian", key: "no" },
    { label: "Jumlah Barang", key: "total_number_item" },
    {
      label: "Total Harga",
      key: "total_price",
      render: (value) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(value),
    },
    { label: "Total Kuantitas", key: "total_quantity" },
    {
      label: "Status",
      key: "status",
      render: (value) => (value === 2 ? "Pending" : "Selesai"),
    },
  ];

  const actions = [
    {
      icon: <FaInfoCircle size={20} />,
      onClick: (row) => handleInfoDetails(row),
      className: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  const statusOptions = [
    { value: 1, label: "Selesai" },
    { value: 2, label: "Pending" },
  ];
  // Filter pembelian list based on search query
  const filteredPembelianList = listPembelian.filter((pembelian) =>
    pembelian.no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Pembelian"
        subtitle="Detail Daftar Pembelian"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearch={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredPembelianList.length === 0 ? (
            <h1 className="p-4 text-center text-gray-500">
              Data Pembelian tidak ditemukan!
            </h1>
          ) : (
            <Table
              fileName="Daftar Pembelian"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredPembelianList.map((pembelian, index) => ({
                ...pembelian,
                no: index + 1,
              }))}
              actions={actions}
              itemsPerPage={10}
              statusOptions={statusOptions}
            />
          )}
        </div>
      </div>

      {/* Info Modal */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => modalOpen("info", false)}
        title="Detail Pembelian"
        width="large"
      >
        {pembelianToUpdate?.pembelianDetails?.map((detail, index) => (
          <div key={index} className="mb-4">
            <div className="font-bold">Detail {index + 1}</div>
            <div className="grid grid-cols-[auto_auto_1fr] gap-y-2 font-sans">
              <span className="text-left font-bold pr-2">Kode Produk</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {detail.product_code || "-"}
              </span>
              <span className="text-left font-bold pr-2">Nama Barang</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">{detail.name || "-"}</span>
              <span className="text-left font-bold pr-2">Harga Barang</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(detail.item_price || 0)}
              </span>
              <span className="text-left font-bold pr-2">Jumlah Barang</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {detail.item_quantity || "-"}
              </span>
              <span className="text-left font-bold pr-2">Diskon</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {detail.item_discount || "-"}
              </span>
            </div>
            <hr className="my-2" />
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default PembelianList;
