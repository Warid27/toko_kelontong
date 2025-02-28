import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaRegEdit, FaInfoCircle } from "react-icons/fa";
import { Modal } from "@/components/Modal";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import { IoMdArrowRoundBack, IoIosArrowDropdown } from "react-icons/io";
import { fetchUserList } from "@/libs/fetching/user";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";
import { fetchOrderList } from "@/libs/fetching/order";
import { fetchSalesCampaignList } from "@/libs/fetching/salesCampaign";
import { fetchSalesList } from "@/libs/fetching/sales";
import { fetchPaymentList } from "@/libs/fetching/payment";
import ReactPaginate from "react-paginate";

const SalesMain = () => {
  // State
  const [saleses, setSaleses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salesToUpdate, setSalesToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // LIST
  const [userList, setUserList] = useState([]); // State for list of users
  const [companyList, setCompanyList] = useState([]); // State for list of users
  const [storeList, setStoreList] = useState([]); // State for list of users
  const [orderList, setOrderList] = useState([]); // State for list of users
  const [sales_campaignList, setsales_campaignList] = useState([]); // State for list of users
  const [paymentList, setPaymentList] = useState([]);

  useEffect(() => {
    const fetching_requirement = async () => {
      const get_user_list = async () => {
        const data_user = await fetchUserList();
        setUserList(data_user);
        setIsLoading(false);
      };
      const get_company_list = async () => {
        const data_company = await fetchCompanyList();
        setCompanyList(data_company);
        setIsLoading(false);
      };
      const get_store_list = async () => {
        const data_store = await fetchStoreList();
        setStoreList(data_store);
        setIsLoading(false);
      };
      const get_order_list = async () => {
        const data_order = await fetchOrderList();
        setOrderList(data_order);
        setIsLoading(false);
      };
      const get_salesCampaign_list = async () => {
        const data_salesCampaign = await fetchSalesCampaignList();
        setsales_campaignList(data_salesCampaign);
        setIsLoading(false);
      };
      const get_sales_list = async () => {
        const data_sales = await fetchSalesList();
        setSaleses(data_sales);
        setIsLoading(false);
      };
      const get_payment_list = async () => {
        const data_payment = await fetchPaymentList();
        setPaymentList(data_payment);
        setIsLoading(false);
      };

      get_user_list();
      get_company_list();
      get_store_list();
      get_order_list();
      get_salesCampaign_list();
      get_sales_list();
      get_payment_list();
    };
    fetching_requirement();
  }, []);

  const [salesDataUpdate, setSalesDataUpdate] = useState({
    id: "",
    no: "",
    id_user: "",
    id_order: "",
    id_sales_campaign: "",
    id_payment_type: "",
    tax: "",
    total_price: "",
    total_discount: "",
    total_quantity: "",
    keterangan: "",
    total_number_item: "",
    status: "",
    salesDetails: [],
  });

  const openModalAdd = () => {
    setIsModalOpen(true);
  };

  const closeModalAdd = () => {
    setIsModalOpen(false);
  };
  const closeModalInfo = () => {
    setIsInfoModalOpen(false);
  };

  const closeModalUpdate = () => {
    setIsUpdateModalOpen(false);
  };

  const token = localStorage.getItem("token");

  const handleStatus = async (salesId, currentStatus) => {
    try {
      setLoading(true);

      const newStatus = currentStatus === 1 ? 2 : 1;

      const response = await client.put(
        `/api/sales/${salesId}`,
        {
          status: newStatus === 1 ? 1 : 2,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response from API:", response.data);

      setSaleses((prevSaleses) =>
        prevSaleses.map((sales) =>
          sales._id === salesId ? { ...sales, status: newStatus } : sales
        )
      );
    } finally {
      setLoading(false);
    }
  };
  // HANDLE

  const handleInfoDetails = (sales) => {
    setSalesToUpdate(sales); // Menyimpan produk yang dipilih
    setIsInfoModalOpen(true);
  };
  const handleUpdateSales = (sales) => {
    setSalesToUpdate(sales); // Menyimpan produk yang dipilih
    setIsUpdateModalOpen(true);
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
        salesDetails: salesToUpdate.salesDetails || "",
      });
    }
  }, [salesToUpdate]);

  const startIndex = currentPage * itemsPerPage;
  const selectedData = saleses.slice(startIndex, startIndex + itemsPerPage);

  // LOADING
  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen pt-16">
      <div className="justify-between w-full bg-white shadow-lg p-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">Daftar Sales</p>
            <p>Detail daftar sales</p>
          </div>
          <div className="relative mt-2 flex flex-row space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search anything here"
                className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs"
              />
              <IoSearchOutline className="absolute left-2 top-2.5 text-xl text-gray-500" />
            </div>
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <Image
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  alt="avatar"
                  width={40}
                  height={40}
                />
              </div>
            </div>
            <button className="button btn-ghost btn-sm rounded-lg">
              <MdKeyboardArrowDown className="text-2xl mt-1" />
            </button>
          </div>
        </div>
        <div className="flex flex-row justify-between mt-8">
          <div>
            <select className="select w-full max-w-xs bg-white border-gray-300">
              <option value="">Best sellers</option>
              <option value="">Ricebowl</option>
              <option value="">Milkshake</option>
            </select>
          </div>
          <div>
            {/* <button
              className="button bg-[#FDDC05] text-white p-2 rounded-lg font-bold"
              onClick={openModalAdd}
            >
              + Tambah Sales
            </button> */}
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
            {saleses.length === 0 ? (
              <h1>Data produk tidak ditemukan!</h1>
            ) : (
              <>
                <table className="table w-full border border-gray-300">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>No Sales</th>
                      <th>Tax</th>
                      <th>Total Price</th>
                      <th>Total Discount</th>
                      <th>Total Quantity</th>
                      <th>Total Number Item</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.map((sales, index) => (
                      <tr key={sales._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>{sales.no}</td>
                        <td>{sales.tax}</td>
                        <td>
                          Rp.
                          {new Intl.NumberFormat("id-ID").format(
                            sales.total_price
                          ) || "-"}
                        </td>
                        <td>{sales.total_discount}</td>
                        <td>{sales.total_quantity}</td>
                        <td>{sales.total_number_item}</td>
                        <td>
                          <input
                            type="checkbox"
                            className="toggle"
                            checked={sales.status === 1}
                            onChange={() =>
                              handleStatus(sales._id, sales.status)
                            }
                          />
                        </td>
                        <td className="flex">
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() => handleUpdateSales(sales)}
                          >
                            <FaRegEdit />
                          </button>
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() => handleInfoDetails(sales)}
                          >
                            <FaInfoCircle />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ReactPaginate
                  previousLabel={"← Prev"}
                  nextLabel={"Next →"}
                  pageCount={Math.ceil(saleses.length / itemsPerPage)}
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

      {isUpdateModalOpen && (
        <Modal onClose={closeModalUpdate} title={"Data Sales"}>
          <div className="grid grid-cols-[auto_auto_1fr] gap-y-2 font-sans">
            <span className="text-left font-bold pr-2">Nomor Sales</span>
            <span className="font-bold px-2">:</span>
            <span className="text-gray-700">{salesDataUpdate.no}</span>

            <span className="text-left font-bold pr-2">Pajak</span>
            <span className="font-bold px-2">:</span>
            <span className="text-gray-700">{salesDataUpdate.tax || "-"}</span>

            <span className="text-left font-bold pr-2">Total Harga</span>
            <span className="font-bold px-2">:</span>
            <span className="text-gray-700">
              {salesDataUpdate.total_price || "-"}
            </span>

            <span className="text-left font-bold pr-2">Total Diskon</span>
            <span className="font-bold px-2">:</span>
            <span className="text-gray-700">
              {salesDataUpdate.total_discount || "-"}
            </span>

            <span className="text-left font-bold pr-2">Total Jumlah</span>
            <span className="font-bold px-2">:</span>
            <span className="text-gray-700">
              {salesDataUpdate.total_quantity || "-"}
            </span>

            <span className="text-left font-bold pr-2">
              Total Jumlah Barang
            </span>
            <span className="font-bold px-2">:</span>
            <span className="text-gray-700">
              {salesDataUpdate.total_number_item || "-"}
            </span>

            <span className="text-left font-bold pr-2">Pengguna</span>
            <span className="font-bold px-2">:</span>
            <span>
              {userList.length > 0
                ? userList.find((c) => c._id === salesDataUpdate.id_user)
                    ?.username || "Belum ada data pengguna"
                : "Tidak ada data pengguna"}
            </span>

            <span className="text-left font-bold pr-2">Nama Toko</span>
            <span className="font-bold px-2">:</span>
            <span>
              {storeList.length > 0
                ? storeList.find((c) => c._id === salesDataUpdate.id_store)
                    ?.name || "Belum ada data toko"
                : "Tidak ada data toko"}
            </span>

            <span className="text-left font-bold pr-2">Perusahaan</span>
            <span className="font-bold px-2">:</span>
            <span>
              {companyList.length > 0
                ? companyList.find((c) => c._id === salesDataUpdate.id_company)
                    ?.name || "Belum ada data perusahaan"
                : "Tidak ada data perusahaan"}
            </span>

            <span className="text-left font-bold pr-2">Pemesanan</span>
            <span className="font-bold px-2">:</span>
            <span>
              {orderList.length > 0
                ? orderList.find((c) => c._id === salesDataUpdate.id_order)
                    ?.person_name || "Belum ada data pemesanan"
                : "Tidak ada data pemesanan"}
            </span>

            <span className="text-left font-bold pr-2">Promo</span>
            <span className="font-bold px-2">:</span>
            <span>
              {sales_campaignList.length > 0
                ? sales_campaignList.find(
                    (c) => c._id === salesDataUpdate.id_sales_campaign
                  )?.campaign_name || "Belum ada data promo"
                : "Tidak ada data promo"}
            </span>

            <span className="text-left font-bold pr-2">Pembayaran</span>
            <span className="font-bold px-2">:</span>
            <span>
              {paymentList.length > 0
                ? paymentList.find(
                    (c) => c._id === salesDataUpdate.id_payment_type
                  )?.payment_method || "Belum ada data pembayaran"
                : "Tidak ada data pembayaran"}
            </span>
          </div>
        </Modal>
      )}

      {/* === INFO === */}
      {isInfoModalOpen && (
        <Modal onClose={closeModalInfo} title={"Sales Detail"}>
          {salesDataUpdate.salesDetails?.map((detail, index) => (
            <div key={index}>
              {console.log("DETIL", detail)}
              <div>Detail {index + 1}</div>
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
              <hr></hr>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
};

export default SalesMain;
