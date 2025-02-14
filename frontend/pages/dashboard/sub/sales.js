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

const SalesMain = () => {
  // State
  const [saleses, setSaleses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salesToUpdate, setSalesToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  // Function
  const [expandedPayments, setexpandedPayments] = useState({});

  // LIST
  const [userList, setUserList] = useState([]); // State for list of users
  const [companyList, setCompanyList] = useState([]); // State for list of users
  const [storeList, setStoreList] = useState([]); // State for list of users
  const [orderList, setOrderList] = useState([]); // State for list of users
  const [sales_campaignList, setsales_campaignList] = useState([]); // State for list of users
  const [payments, setPayments] = useState([]);

  const [salesDataAdd, setSalesDataAdd] = useState({
    no: "",
    id_user: "",
    id_store: "",
    id_order: "",
    id_sales_campaign: "",
    id_payment_type: "",
    tax: "",
    total_price: "",
    total_discount: "",
    total_quantity: "",
    total_number_item: "",
    status: "",
  });

  const [salesDataUpdate, setSalesDataUpdate] = useState({
    id: "",
    no: "",
    id_user: "",
    id_store: "",
    id_order: "",
    id_sales_campaign: "",
    id_payment_type: "",
    tax: "",
    total_price: "",
    total_discount: "",
    total_quantity: "",
    total_number_item: "",
    status: "",
  });

  const openModalAdd = () => {
    setIsModalOpen(true);
  };

  const closeModalAdd = () => {
    setIsModalOpen(false);
  };
  const openModalUpdate = () => {
    setIsUpdateModalOpen(true);
  };

  const closeModalUpdate = () => {
    setIsUpdateModalOpen(false);
  };

  const handleStatus = async (salesId, currentStatus) => {
    try {
      setLoading(true);

      const newStatus = currentStatus === 1 ? 2 : 1;

      const response = await client.put(`/api/sales/${salesId}`, {
        status: newStatus === 1 ? 1 : 2,
      });

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
  // FETCH

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await client.post("/user/listuser", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /user/listuser:", data);
          setUserList([]);
        } else {
          setUserList(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUserList([]);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await client.post("/company/listcompany", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /company/listcompany:",
            data
          );
          setCompanyList([]);
        } else {
          setCompanyList(data);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanyList([]);
      }
    };
    fetchCompany();
  }, []);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await client.post("/store/liststore", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /store/liststore:", data);
          setStoreList([]);
        } else {
          setStoreList(data);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
        setStoreList([]);
      }
    };
    fetchStore();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await client.post("/order/listorder", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /order/listorder:", data);
          setOrderList([]);
        } else {
          setOrderList(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrderList([]);
      }
    };
    fetchOrder();
  }, []);

  useEffect(() => {
    const fetchSalesCampaign = async () => {
      try {
        const response = await client.post(
          "/salescampaign/listsalescampaign",
          {}
        );
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /salescampaign/listsalescampaign:",
            data
          );
          setsales_campaignList([]);
        } else {
          setsales_campaignList(data);
        }
      } catch (error) {
        console.error("Error fetching salescampaigns:", error);
        setsales_campaignList([]);
      }
    };
    fetchSalesCampaign();
  }, []);

  useEffect(() => {
    const fetchSaleses = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_store = localStorage.getItem("id_store");

        if (!id_store) {
          console.error("id_store is missing in localStorage");
          setIsLoading(false);
          return;
        }

        const response = await client.post(
          "/sales/listsales",
          { id_store }, // Pass id_store in the request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Set the fetched saleses into state
        setSaleses(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching saleses:", error);
        setIsLoading(false);
      }
    };

    fetchSaleses();
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.post("/payment/listpayment", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Flatten the paymentName arrays into a single list
        const flattenedPayments = response.data.flatMap((paymentType) =>
          paymentType.paymentName.map((payment) => ({
            ...payment,
            payment_method: paymentType.payment_method,
          }))
        );

        setPayments(flattenedPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setError("Failed to load payment methods. Please try again later.");
      }
    };
    fetchPayments();
  }, []);

  // HANDLE
  const handleUpdateSales = (sales) => {
    setSalesToUpdate(sales); // Menyimpan produk yang dipilih
    setIsUpdateModalOpen(true);

    console.log(sales);
  };

  const deleteSalesById = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await client.delete(`/api/sales/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "Produk berhasil dihapus!", "success");
          setSaleses((prevSaleses) => prevSaleses.filter((p) => p._id !== id));
        }
      } catch (error) {
        console.error("Gagal menghapus produk:", error.message);
        Swal.fire("Gagal", "Produk tidak dapat dihapus!", "error");
      }
    }
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setSalesDataAdd((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      // Ensure all required fields are filled
      if (
        !salesDataAdd.no ||
        !salesDataAdd.id_user ||
        !salesDataAdd.id_store ||
        !salesDataAdd.id_order ||
        !salesDataAdd.id_sales_campaign ||
        !salesDataAdd.tax ||
        !salesDataAdd.total_price ||
        !salesDataAdd.total_discount ||
        !salesDataAdd.total_quantity ||
        !salesDataAdd.total_number_item ||
        !selectedMethod._id
      ) {
        alert("Please fill all required fields.");
        return;
      }

      // Send sales data to the backend
      const response = await client.post(
        "/sales/addsales",
        {
          no: salesDataAdd.no || "",
          id_user: salesDataAdd.id_user || "",
          id_store: salesDataAdd.id_store || "",
          id_user: salesDataAdd.id_user || "",
          id_order: salesDataAdd.id_order || "",
          id_sales_campaign: salesDataAdd.id_sales_campaign || "",
          id_payment_type: selectedMethod._id || "",
          tax: salesDataAdd.tax || "",
          total_price: salesDataAdd.total_price || "",
          total_discount: salesDataAdd.total_discount || "",
          total_quantity: salesDataAdd.total_quantity || "",
          total_number_item: salesDataAdd.total_number_item || "",
          status: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Berhasil", "Produk berhasil ditambahkan!", "success");

      window.location.reload();
    } catch (error) {
      console.error("Error adding sales:", error);
    }
  };

  useEffect(() => {
    if (salesToUpdate) {
      setSalesDataUpdate({
        id: salesToUpdate._id || "",
        no: salesToUpdate.no || "",
        id_user: salesToUpdate.id_user || "",
        id_store: salesToUpdate.id_store || "",
        id_user: salesToUpdate.id_user || "",
        id_order: salesToUpdate.id_order || "",
        id_sales_campaign: salesToUpdate.id_sales_campaign || "",
        id_payment_type: salesToUpdate.id_payment_type || "",
        tax: salesToUpdate.tax || "",
        total_price: salesToUpdate.total_price || "",
        total_discount: salesToUpdate.total_discount || "",
        total_quantity: salesToUpdate.total_quantity || "",
        total_number_item: salesToUpdate.total_number_item || "",
        status: salesToUpdate.status || "",
      });
    }
  }, [salesToUpdate]);

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setSalesDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/sales/${salesDataUpdate.id}`,
        {
          no: salesDataUpdate.no,
          id_user: salesDataUpdate.id_user,
          id_store: salesDataUpdate.id_store,
          id_user: salesDataUpdate.id_user,
          id_order: salesDataUpdate.id_order,
          id_sales_campaign: salesDataUpdate.id_sales_campaign,
          id_payment_type: salesDataUpdate.id_payment_type,
          tax: salesDataUpdate.tax,
          total_price: salesDataUpdate.total_price,
          total_discount: salesDataUpdate.total_discount,
          total_quantity: salesDataUpdate.total_quantity,
          total_number_item: salesDataUpdate.total_number_item,
          status: salesDataUpdate.status,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Sales updated successfully:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error updating sales:", error);
    }
  };

  // FUNGSI
  // PAYMENTS
  const groupedPayments = payments.reduce((acc, payment) => {
    if (!acc[payment.payment_method]) {
      acc[payment.payment_method] = [];
    }
    acc[payment.payment_method].push(payment);
    return acc;
  }, {});
  const togglePayments = (payments) => {
    setexpandedPayments((prev) => ({
      ...prev,
      [payments]: !prev[payments],
    }));
  };
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
              <option disabled selected>
                Best sellers
              </option>
              <option>Ricebowl</option>
              <option>Milkshake</option>
            </select>
          </div>
          <div>
            <button
              className="button bg-[#FDDC05] text-white p-2 rounded-lg font-bold"
              onClick={openModalAdd}
            >
              + Tambah Sales
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {saleses.length === 0 ? (
              <h1>Data produk tidak ditemukan!</h1>
            ) : (
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
                  {saleses.map((sales, index) => (
                    <tr key={sales._id}>
                      <td>{index + 1}</td>
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
                          checked={sales.status === 2}
                          onChange={() => handleStatus(sales._id, sales.status)}
                        />
                      </td>
                      <td className="flex">
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => deleteSalesById(sales._id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdateSales(sales)}
                        >
                          <FaRegEdit />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdateSalesDetails(sales)}
                        >
                          <FaInfoCircle />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={closeModalAdd} title={"Tambah Sales"}>
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Nomor Sales</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="text"
              name="no"
              value={salesDataAdd.no}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
              maxLength={100}
            />
            <p className="font-semibold mt-4">Pajak</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="number"
              name="tax"
              value={salesDataAdd.tax}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Total Harga</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="number"
              name="total_price"
              value={salesDataAdd.total_price}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Total Diskon</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="number"
              name="total_discount"
              value={salesDataAdd.total_discount}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Total Jumlah</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="number"
              name="total_quantity"
              value={salesDataAdd.total_quantity}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Total Jumlah Barang</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="number"
              name="total_number_item"
              value={salesDataAdd.total_number_item}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Pengguna</p>
            <p className="mb-2 text-sm text-slate-500">Include Pengguna</p>
            {/* === USER === */}
            {
              <select
                name="user"
                id="user"
                className="border rounded-md p-2 w-full bg-white"
                onChange={(e) =>
                  setSalesDataAdd((prevState) => ({
                    ...prevState,
                    id_user: e.target.value,
                  }))
                }
                value={salesDataAdd.id_user}
                required
              >
                <option value="" disabled>
                  === Pilih Pengguna ===
                </option>

                {userList.length === 0 ? (
                  <option value="default">No user available</option>
                ) : (
                  userList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.username}
                    </option>
                  ))
                )}
              </select>
            }
            <p className="font-semibold mt-4 mb-2">Toko</p>
            <p className="mb-2 text-sm text-slate-500">Include Toko</p>
            {/* === TOKO === */}
            {
              <select
                name="store"
                id="store"
                className="border rounded-md p-2 w-full bg-white"
                onChange={(e) =>
                  setSalesDataAdd((prevState) => ({
                    ...prevState,
                    id_store: e.target.value,
                  }))
                }
                value={salesDataAdd.id_store}
                required
              >
                <option value="" disabled>
                  === Pilih Toko ===
                </option>

                {storeList.length === 0 ? (
                  <option value="default">No store available</option>
                ) : (
                  storeList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            }
            <p className="font-semibold mt-4 mb-2">Perusahaan</p>
            <p className="mb-2 text-sm text-slate-500">Include Perusahaan</p>
            {/* === PERUSAHAAN === */}
            {
              <select
                name="company"
                id="company"
                className="border rounded-md p-2 w-full bg-white"
                onChange={(e) =>
                  setSalesDataAdd((prevState) => ({
                    ...prevState,
                    id_company: e.target.value,
                  }))
                }
                value={salesDataAdd.id_company}
                required
              >
                <option value="" disabled>
                  === Pilih Perusahaan ===
                </option>

                {companyList.length === 0 ? (
                  <option value="default">No company available</option>
                ) : (
                  companyList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            }

            <p className="font-semibold mt-4 mb-2">Pemesanan</p>
            <p className="mb-2 text-sm text-slate-500">Include Pemesanan</p>
            {/* === ORDER === */}
            {
              <select
                name="order"
                id="order"
                className="border rounded-md p-2 w-full bg-white"
                onChange={(e) =>
                  setSalesDataAdd((prevState) => ({
                    ...prevState,
                    id_order: e.target.value,
                  }))
                }
                value={salesDataAdd.id_order}
                required
              >
                <option value="" disabled>
                  === Pilih Pemesanan ===
                </option>

                {orderList.length === 0 ? (
                  <option value="default">No order available</option>
                ) : (
                  orderList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.person_name}
                    </option>
                  ))
                )}
              </select>
            }
            <p className="font-semibold mt-4 mb-2">Sales Promo</p>
            <p className="mb-2 text-sm text-slate-500">Include Sales Promo</p>
            {/* === SALES CAMPAIGN === */}
            {
              <select
                name="sales_campaign"
                id="sales_campaign"
                className="border rounded-md p-2 w-full bg-white"
                onChange={(e) =>
                  setSalesDataAdd((prevState) => ({
                    ...prevState,
                    id_sales_campaign: e.target.value,
                  }))
                }
                value={salesDataAdd.id_sales_campaign}
                required
              >
                <option value="" disabled>
                  === Pilih Promo ===
                </option>

                {sales_campaignList.length === 0 ? (
                  <option value="default">No sales_campaign available</option>
                ) : (
                  sales_campaignList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.campaign_name}
                    </option>
                  ))
                )}
              </select>
            }
            <p className="font-semibold mt-4 mb-2">Tipe Pembayaran</p>
            <p className="mb-2 text-sm text-slate-500">
              Include Tipe Pembayaran
            </p>
            {/* === PEMBAYARAN === */}

            {/* Pilih Metode Pembayaran */}
            <div className="border rounded-lg mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
              <div className="bg-orange-500 text-white p-3 rounded-t-lg font-bold">
                Pilih Metode Pembayaran
              </div>
              <div className="p-2 space-y-1">
                {Object.keys(groupedPayments).map((payments) => (
                  <div key={payments}>
                    {/* Payments Header */}
                    <div
                      className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                      onClick={() => togglePayments(payments)}
                    >
                      <span className="font-semibold">{payments}</span>
                      <span
                        className={`transition-transform duration-200 ${
                          expandedPayments[payments] ? "rotate-180" : ""
                        }`}
                      >
                        <IoIosArrowDropdown />
                      </span>
                    </div>

                    {/* Payment Methods (Dropdown Content) */}
                    {expandedPayments[payments] && (
                      <div className="pl-4 mt-2 space-y-2">
                        {groupedPayments[payments].map((payment) => (
                          <label
                            key={payment._id}
                            className="flex items-center cursor-pointer w-full p-2 gap-3 rounded-md hover:bg-orange-50 peer-checked:bg-orange-50"
                          >
                            <div className="relative w-6 h-6 flex items-center justify-center">
                              <div className="absolute w-5 h-5 bg-white rounded-full border-2 border-gray-400"></div>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={payment._id}
                                checked={selectedMethod?._id === payment._id}
                                onChange={() => setSelectedMethod(payment)}
                                className="peer relative w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-orange-500 transition-all duration-200"
                                aria-label={payment.payment_name}
                              />
                              <div className="absolute w-3 h-3 bg-orange-500 rounded-full scale-0 peer-checked:scale-100 transition-all duration-200"></div>
                            </div>
                            <div className="flex items-center justify-center gap-5">
                              <img
                                src={payment.image}
                                alt={`${payment.payment_name} logo`}
                                className="object-contain w-8 h-8"
                              />
                              <span>{payment.payment_name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button type="button" className="mr-2" onClick={closeModalAdd}>
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Kirim
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isUpdateModalOpen && (
        <Modal onClose={closeModalUpdate} title={"Edit Sales"}>
          <form onSubmit={handleSubmitUpdate}>
            {/* <p className="font-semibold">Gambar Produk</p>
            <p className="mb-2 text-sm text-slate-500">
              Format .jpg .jpeg .png dan minimal ukuran 300 x 300px
            </p>
            <div className="upload-container">
              <label className="upload-label">
                <input
                  type="hidden"
                  name="_id"
                  value={salesDataUpdate._id}
                  onChange={handleChangeUpdate}
                  className="border rounded-md p-2 w-full bg-white"
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChangeUpdate}
                  style={{ display: "none" }}
                />
                <div className="upload-content">
                  {salesDataUpdate.image ? (
                    <Image
                      src={
                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      }
                      alt="Uploaded Image"
                      width={80}
                      height={80}
                      className="uploaded-image"
                    />
                  ) : (
                    <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                      <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                      <p className="text-sm text-[#FDDC05]">New Image</p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <p className="font-semibold mt-4">Nama Produk</p>
            <input
              type="text"
              name="name_sales"
              value={salesDataUpdate.name_sales}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Stock</p>
            <input
              type="text"
              name="stock"
              value={salesDataUpdate.stock}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Barcode</p>
            <input
              type="text"
              name="barcode"
              value={salesDataUpdate.barcode}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Harga</p>
            <input
              type="text"
              name="sell_price"
              value={salesDataUpdate.sell_price}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Sales Code</p>
            <input
              type="text"
              name="sales_code"
              value={salesDataUpdate.sales_code}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Deskripsi Produk</p>
            <textarea
              name="deskripsi"
              value={salesDataUpdate.deskripsi}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Category</p>
            <select
              id="category"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={salesDataUpdate.id_category_sales}
              onChange={(e) =>
                setSalesDataUpdate((prevState) => ({
                  ...prevState,
                  id_category_sales: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Category ===
              </option>

              {categoryList.length === 0 ? (
                <option value="default" disabled>
                  No category available
                </option>
              ) : (
                categoryList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name_category}
                  </option>
                ))
              )}
            </select> */}
            <p className="font-semibold mt-4">Nomor Sales</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="text"
              name="no"
              value={salesDataUpdate.no}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
              maxLength={100}
            />
            <p className="font-semibold mt-4">Pajak</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="number"
              name="tax"
              value={salesDataUpdate.tax}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Total Harga</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="number"
              name="total_price"
              value={salesDataUpdate.total_price}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Total Diskon</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="number"
              name="total_discount"
              value={salesDataUpdate.total_discount}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Total Jumlah</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="number"
              name="total_quantity"
              value={salesDataUpdate.total_quantity}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Total Jumlah Barang</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 10 characters to make it more interesting
            </p>
            <input
              type="number"
              name="total_number_item"
              value={salesDataUpdate.total_number_item}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Pengguna</p>
            <p className="mb-2 text-sm text-slate-500">Include Pengguna</p>
            {/* === USER === */}
            {
              <select
                name="user"
                id="user"
                className="border rounded-md p-2 w-full bg-white"
                onChange={(e) =>
                  setSalesDataUpdate((prevState) => ({
                    ...prevState,
                    id_user: e.target.value,
                  }))
                }
                value={salesDataUpdate.id_user}
                required
              >
                <option value="" disabled>
                  === Pilih Pengguna ===
                </option>

                {userList.length === 0 ? (
                  <option value="default">No user available</option>
                ) : (
                  userList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.username}
                    </option>
                  ))
                )}
              </select>
            }
            <p className="font-semibold mt-4 mb-2">Toko</p>
            <p className="mb-2 text-sm text-slate-500">Include Toko</p>
            {/* === TOKO === */}
            {
              <select
                name="store"
                id="store"
                className="border rounded-md p-2 w-full bg-white"
                onChange={(e) =>
                  setSalesDataUpdate((prevState) => ({
                    ...prevState,
                    id_store: e.target.value,
                  }))
                }
                value={salesDataUpdate.id_store}
                required
              >
                <option value="" disabled>
                  === Pilih Toko ===
                </option>

                {storeList.length === 0 ? (
                  <option value="default">No store available</option>
                ) : (
                  storeList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            }
            <p className="font-semibold mt-4 mb-2">Perusahaan</p>
            <p className="mb-2 text-sm text-slate-500">Include Perusahaan</p>
            {/* === PERUSAHAAN === */}
            {
              <select
                name="company"
                id="company"
                className="border rounded-md p-2 w-full bg-white"
                onChange={(e) =>
                  setSalesDataUpdate((prevState) => ({
                    ...prevState,
                    id_company: e.target.value,
                  }))
                }
                value={salesDataUpdate.id_company}
                required
              >
                <option value="" disabled>
                  === Pilih Perusahaan ===
                </option>

                {companyList.length === 0 ? (
                  <option value="default">No company available</option>
                ) : (
                  companyList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            }

            <p className="font-semibold mt-4 mb-2">Pemesanan</p>
            <p className="mb-2 text-sm text-slate-500">Include Pemesanan</p>
            {/* === ORDER === */}
            {
              <select
                name="order"
                id="order"
                className="border rounded-md p-2 w-full bg-white"
                onChange={(e) =>
                  setSalesDataUpdate((prevState) => ({
                    ...prevState,
                    id_order: e.target.value,
                  }))
                }
                value={salesDataUpdate.id_order}
                required
              >
                <option value="" disabled>
                  === Pilih Pemesanan ===
                </option>

                {orderList.length === 0 ? (
                  <option value="default">No order available</option>
                ) : (
                  orderList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.person_name}
                    </option>
                  ))
                )}
              </select>
            }
            <p className="font-semibold mt-4 mb-2">Sales Promo</p>
            <p className="mb-2 text-sm text-slate-500">Include Sales Promo</p>
            {/* === SALES CAMPAIGN === */}
            {
              <select
                name="sales_campaign"
                id="sales_campaign"
                className="border rounded-md p-2 w-full bg-white"
                onChange={(e) =>
                  setSalesDataUpdate((prevState) => ({
                    ...prevState,
                    id_sales_campaign: e.target.value,
                  }))
                }
                value={salesDataUpdate.id_sales_campaign}
                required
              >
                <option value="" disabled>
                  === Pilih Promo ===
                </option>

                {sales_campaignList.length === 0 ? (
                  <option value="default">No sales_campaign available</option>
                ) : (
                  sales_campaignList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.campaign_name}
                    </option>
                  ))
                )}
              </select>
            }
            <p className="font-semibold mt-4 mb-2">Tipe Pembayaran</p>
            <p className="mb-2 text-sm text-slate-500">
              Include Tipe Pembayaran
            </p>
            {/* === PEMBAYARAN === */}

            {/* Pilih Metode Pembayaran */}
            <div className="border rounded-lg mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
              <div className="bg-orange-500 text-white p-3 rounded-t-lg font-bold">
                Pilih Metode Pembayaran
              </div>
              <div className="p-2 space-y-1">
                {Object.keys(groupedPayments).map((payments) => (
                  <div key={payments}>
                    {/* Payments Header */}
                    <div
                      className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                      onClick={() => togglePayments(payments)}
                    >
                      <span className="font-semibold">{payments}</span>
                      <span
                        className={`transition-transform duration-200 ${
                          expandedPayments[payments] ? "rotate-180" : ""
                        }`}
                      >
                        <IoIosArrowDropdown />
                      </span>
                    </div>

                    {/* Payment Methods (Dropdown Content) */}
                    {expandedPayments[payments] && (
                      <div className="pl-4 mt-2 space-y-2">
                        {groupedPayments[payments].map((payment) => (
                          <label
                            key={payment._id}
                            className="flex items-center cursor-pointer w-full p-2 gap-3 rounded-md hover:bg-orange-50 peer-checked:bg-orange-50"
                          >
                            <div className="relative w-6 h-6 flex items-center justify-center">
                              <div className="absolute w-5 h-5 bg-white rounded-full border-2 border-gray-400"></div>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={payment._id}
                                checked={selectedMethod?._id === payment._id}
                                onChange={() => setSelectedMethod(payment)}
                                className="peer relative w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-orange-500 transition-all duration-200"
                                aria-label={payment.payment_name}
                              />
                              <div className="absolute w-3 h-3 bg-orange-500 rounded-full scale-0 peer-checked:scale-100 transition-all duration-200"></div>
                            </div>
                            <div className="flex items-center justify-center gap-5">
                              <img
                                src={payment.image}
                                alt={`${payment.payment_name} logo`}
                                className="object-contain w-8 h-8"
                              />
                              <span>{payment.payment_name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* PEMISAH */}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="mr-2 bg-gray-400 text-white p-2 rounded-lg"
                onClick={closeModalUpdate}
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SalesMain;
