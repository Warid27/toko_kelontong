import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Icons
import { IoSearchOutline } from "react-icons/io5";
import { FaRegEdit, FaInfoCircle } from "react-icons/fa";

// Components
import Table from "@/components/form/table";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";

// Libraries
import { fetchUserList } from "@/libs/fetching/user";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";
import { fetchOrderList } from "@/libs/fetching/order";
import { fetchSalesCampaignList } from "@/libs/fetching/salesCampaign";
import { fetchSalesList, updateSalesStatus } from "@/libs/fetching/sales";
import { fetchPaymentList } from "@/libs/fetching/payment";
import useUserStore from "@/stores/user-store";

// Packages
import { toast } from "react-toastify";

const SalesMain = () => {
  const { userData } = useUserStore();
  const id_store = userData?.id_store;

  // State
  const [saleses, setSaleses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [salesToUpdate, setSalesToUpdate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Lists
  const [userList, setUserList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [salesCampaignList, setSalesCampaignList] = useState([]);
  const [paymentList, setPaymentList] = useState([]);

  const [salesDataUpdate, setSalesDataUpdate] = useState({
    id: "",
    no: "",
    id_user: "",
    id_store: "",
    id_company: "",
    id_order: "",
    id_sales_campaign: "",
    id_payment_type: "",
    tax: "",
    total_price: "",
    total_discount: "",
    total_quantity: "",
    total_number_item: "",
    status: "",
    salesDetails: [],
  });

  // Header Table
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "No Sales", key: "no_sales" },
    { label: "Tax", key: "tax" },
    { label: "Total Price", key: "total_price" },
    { label: "Total Discount", key: "total_discount" },
    { label: "Total Quantity", key: "total_quantity" },
    { label: "Total Number Item", key: "total_number_item" },
    { label: "Status", key: "status" },
  ];

  const HeaderTable = [
    { label: "No Sales", key: "no" },
    {
      label: "Tax",
      key: "tax",
      render: (value) => `${value * 100}%`,
    },
    {
      label: "Total Price",
      key: "total_price",
      render: (value) =>
        `Rp. ${new Intl.NumberFormat("id-ID").format(value) || "-"}`,
    },
    {
      label: "Total Discount",
      key: "total_discount",
      render: (value) => `${value * 100}%`,
    },
    { label: "Total Quantity", key: "total_quantity" },
    { label: "Total Number Item", key: "total_number_item" },
    {
      label: "Status",
      key: "status",
      render: (value, row) => (
        <input
          type="checkbox"
          className="toggle"
          checked={value === 1}
          onChange={() =>
            handleStatus(saleses.find((s) => s._id === row._id)._id, value)
          }
        />
      ),
    },
  ];

  const actions = [
    {
      icon: <FaRegEdit size={20} />,
      onClick: (row) => handleUpdateSales(row),
      className: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: <FaInfoCircle size={20} />,
      onClick: (row) => handleInfoDetails(row),
      className: "bg-green-500 hover:bg-green-600",
    },
  ];

  // --- Functions
  const modalOpen = (param, bool) => {
    const setters = { update: setIsUpdateModalOpen, info: setIsInfoModalOpen };
    if (setters[param]) setters[param](bool);
  };

  useEffect(() => {
    const fetching_requirement = async () => {
      const get_user_list = async () => {
        const data = await fetchUserList();
        setUserList(data);
      };
      const get_company_list = async () => {
        const data = await fetchCompanyList();
        setCompanyList(data);
      };
      const get_store_list = async () => {
        const data = await fetchStoreList();
        setStoreList(data);
      };
      const get_order_list = async () => {
        const data = await fetchOrderList();
        setOrderList(data);
      };
      const get_salesCampaign_list = async () => {
        const data = await fetchSalesCampaignList(id_store);
        setSalesCampaignList(data);
      };
      const get_sales_list = async () => {
        const data = await fetchSalesList(id_store);
        setSaleses(data);
      };
      const get_payment_list = async () => {
        const data = await fetchPaymentList();
        setPaymentList(data);
      };
      await Promise.all([
        get_user_list(),
        get_company_list(),
        get_store_list(),
        get_order_list(),
        get_salesCampaign_list(),
        get_sales_list(),
        get_payment_list(),
      ]);
      setIsLoading(false);
    };
    fetching_requirement();
  }, [id_store]);

  const handleStatus = async (salesId, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === 1 ? 2 : 1;
      const response = await updateSalesStatus(salesId, { status: newStatus });
      if (response.status === 200) {
        setSaleses((prev) =>
          prev.map((sales) =>
            sales._id === salesId ? { ...sales, status: newStatus } : sales
          )
        );
        toast.success("Status sales berhasil diubah!");
      } else {
        toast.error("Gagal mengubah status: " + response.error);
      }
    } catch (error) {
      toast.error("Error updating status: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSales = (sales) => {
    setSalesToUpdate(sales);
    modalOpen("update", true);
  };

  const handleInfoDetails = (sales) => {
    setSalesToUpdate(sales);
    modalOpen("info", true);
  };

  useEffect(() => {
    if (salesToUpdate) {
      setSalesDataUpdate({
        id: salesToUpdate._id || "",
        no: salesToUpdate.no || "",
        id_user: salesToUpdate.id_user || "",
        id_store: salesToUpdate.id_store || "",
        id_company: salesToUpdate.id_company || "",
        id_order: salesToUpdate.id_order || "",
        id_sales_campaign: salesToUpdate.id_sales_campaign || "",
        id_payment_type: salesToUpdate.id_payment_type || "",
        tax: salesToUpdate.tax || "",
        total_price: salesToUpdate.total_price || "",
        total_discount: salesToUpdate.total_discount || "",
        total_quantity: salesToUpdate.total_quantity || "",
        total_number_item: salesToUpdate.total_number_item || "",
        status: salesToUpdate.status || "",
        salesDetails: salesToUpdate.salesDetails || [],
      });
    }
  }, [salesToUpdate]);

  const filteredSalesList = saleses.filter(
    (sales) =>
      sales.no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sales.status === 1 && "active".includes(searchQuery.toLowerCase())) ||
      (sales.status === 2 && "inactive".includes(searchQuery.toLowerCase()))
  );

  const dataForExport = filteredSalesList.map((item, index) => ({
    no: index + 1,
    no_sales: item.no,
    tax: `${item.tax * 100}%`,
    total_price: `Rp. ${
      new Intl.NumberFormat("id-ID").format(item.total_price) || "-"
    }`,
    total_discount: `${item.total_discount * 100}%`,
    total_quantity: item.total_quantity,
    total_number_item: item.total_number_item,
    status: item.status === 1 ? "Active" : "Inactive",
  }));

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Sales"
        subtitle="Detail Daftar Sales"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={false} // Tidak ada tombol tambah
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredSalesList.length === 0 ? (
            <h1>Data sales tidak ditemukan!</h1>
          ) : (
            <Table
              fileName="Data Sales"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredSalesList}
              actions={actions}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => modalOpen("update", false)}
        title="Data Sales"
        width="large"
      >
        <div className="grid grid-cols-[auto_auto_1fr] gap-y-2 font-sans">
          <span className="text-left font-bold pr-2">Nomor Sales</span>
          <span className="font-bold px-2">:</span>
          <span className="text-gray-700">{salesDataUpdate.no || "-"}</span>

          <span className="text-left font-bold pr-2">Pajak</span>
          <span className="font-bold px-2">:</span>
          <span className="text-gray-700">
            {salesDataUpdate.tax ? `${salesDataUpdate.tax * 100}%` : "-"}
          </span>

          <span className="text-left font-bold pr-2">Total Harga</span>
          <span className="font-bold px-2">:</span>
          <span className="text-gray-700">
            {salesDataUpdate.total_price
              ? `Rp. ${new Intl.NumberFormat("id-ID").format(
                  salesDataUpdate.total_price
                )}`
              : "-"}
          </span>

          <span className="text-left font-bold pr-2">Total Diskon</span>
          <span className="font-bold px-2">:</span>
          <span className="text-gray-700">
            {salesDataUpdate.total_discount
              ? `${salesDataUpdate.total_discount * 100}%`
              : "-"}
          </span>

          <span className="text-left font-bold pr-2">Total Jumlah</span>
          <span className="font-bold px-2">:</span>
          <span className="text-gray-700">
            {salesDataUpdate.total_quantity || "-"}
          </span>

          <span className="text-left font-bold pr-2">Total Jumlah Barang</span>
          <span className="font-bold px-2">:</span>
          <span className="text-gray-700">
            {salesDataUpdate.total_number_item || "-"}
          </span>

          <span className="text-left font-bold pr-2">Pengguna</span>
          <span className="font-bold px-2">:</span>
          <span>
            {userList.find((c) => c._id === salesDataUpdate.id_user)
              ?.username || "Belum ada data pengguna"}
          </span>

          <span className="text-left font-bold pr-2">Nama Toko</span>
          <span className="font-bold px-2">:</span>
          <span>
            {storeList.find((c) => c._id === salesDataUpdate.id_store)?.name ||
              "Belum ada data toko"}
          </span>

          <span className="text-left font-bold pr-2">Perusahaan</span>
          <span className="font-bold px-2">:</span>
          <span>
            {companyList.find((c) => c._id === salesDataUpdate.id_company)
              ?.name || "Belum ada data perusahaan"}
          </span>

          <span className="text-left font-bold pr-2">Pemesanan</span>
          <span className="font-bold px-2">:</span>
          <span>
            {orderList.find((c) => c._id === salesDataUpdate.id_order)
              ?.person_name || "Belum ada data pemesanan"}
          </span>

          <span className="text-left font-bold pr-2">Promo</span>
          <span className="font-bold px-2">:</span>
          <span>
            {salesCampaignList.find(
              (c) => c._id === salesDataUpdate.id_sales_campaign
            )?.campaign_name || "Belum ada data promo"}
          </span>

          <span className="text-left font-bold pr-2">Pembayaran</span>
          <span className="font-bold px-2">:</span>
          <span>
            {paymentList.find((c) => c._id === salesDataUpdate.id_payment_type)
              ?.payment_method || "Belum ada data pembayaran"}
          </span>
        </div>
      </Modal>

      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => modalOpen("info", false)}
        title="Sales Detail"
        width="large"
      >
        {salesDataUpdate.salesDetails?.length > 0 ? (
          salesDataUpdate.salesDetails.map((detail, index) => (
            <div key={index}>
              <div className="font-semibold mt-4">Detail {index + 1}</div>
              <div className="grid grid-cols-[auto_auto_1fr] gap-y-2 font-sans">
                <span className="text-left font-bold pr-2">Kode Produk</span>
                <span className="font-bold px-2">:</span>
                <span className="text-gray-700">
                  {detail.id_product?.product_code || "-"}
                </span>

                <span className="text-left font-bold pr-2">
                  Nama Sales Detail
                </span>
                <span className="font-bold px-2">:</span>
                <span className="text-gray-700">{detail.name || "-"}</span>
              </div>
              <hr className="my-2" />
            </div>
          ))
        ) : (
          <p>Tidak ada detail sales tersedia.</p>
        )}
      </Modal>
    </div>
  );
};

export default SalesMain;
