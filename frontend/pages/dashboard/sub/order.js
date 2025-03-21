import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Icon
import { FaInfoCircle } from "react-icons/fa";

// Components
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Table from "@/components/form/table";
import Loading from "@/components/loading";

// API Functions
import { fetchOrderList } from "@/libs/fetching/order";
import { fetchTableList } from "@/libs/fetching/table";

const Order = ({ userData }) => {
  const [listOrder, setListOrder] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);

  const id_store = userData?.id_store;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderData, tableData] = await Promise.all([
          fetchOrderList(id_store),
          fetchTableList(),
        ]);
        setListOrder(orderData);
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
  const handleInfoDetails = (order) => {
    setOrderToUpdate(order);
    modalOpen("info", true);
  };

  // Table configuration
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Pelanggan", key: "person_name" },
    { label: "No Meja", key: "table_name" },
    { label: "Jumlah Pesanan", key: "order_count" },
    { label: "Total Harga", key: "total_price" },
    { label: "Status", key: "status" },
  ];

  const HeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Pelanggan", key: "person_name" },
    {
      label: "No Meja",
      key: "table_name",
      render: (_, row) =>
        tableList.find((tl) => tl._id === row.id_table_cust)?.name || "Unknown",
    },
    {
      label: "Jumlah Pesanan",
      key: "order_count",
      render: (_, row) => row.orderDetails.length,
    },
    {
      label: "Total Harga",
      key: "total_price",
      render: (_, row) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(
          row.orderDetails.reduce((acc, curr) => acc + curr.total_price, 0)
        ),
    },
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

  // Filter order list based on search query
  const filteredOrderList = listOrder.filter(
    (order) =>
      order.person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tableList
        .find((tl) => tl._id === order.id_table_cust)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Orderan"
        subtitle="Detail Daftar Orderan"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearch={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredOrderList.length === 0 ? (
            <h1 className="p-4 text-center text-gray-500">
              Data Orderan tidak ditemukan!
            </h1>
          ) : (
            <Table
              fileName="Daftar Orderan"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredOrderList.map((order, index) => ({
                ...order,
                no: index + 1,
              }))}
              actions={actions}
              itemsPerPage={10} // Pagination support
            />
          )}
        </div>
      </div>

      {/* Info Modal */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => modalOpen("info", false)}
        title="Detail Orderan"
        width="large"
      >
        {orderToUpdate?.orderDetails?.map((detail, index) => (
          <div key={index} className="mb-4">
            <div className="font-bold">Detail {index + 1}</div>
            <div className="grid grid-cols-[auto_auto_1fr] gap-y-2 font-sans">
              <span className="text-left font-bold pr-2">Kode Produk</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {detail.id_product?.product_code || "-"}
              </span>
              <span className="text-left font-bold pr-2">
                Nama Order Detail
              </span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {detail.name_product || "-"}
              </span>
            </div>
            <hr className="my-2" />
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default Order;
