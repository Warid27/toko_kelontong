import React, { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import DateTimePicker from "@/components/DateTimePicker";
import client from "@/libs/axios";
import SalesChart from "@/components/SalesChart";
import { Modal } from "@/components/Modal";
import { formatNumber } from "@/utils/formatNumber";

export const Report = () => {
  const [salesReportList, setSalesReportList] = useState([]);
  const [orderReportList, setOrderReportList] = useState([]);
  const [filterBy, setFilterBy] = useState("daily");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderDetailsList, setOrderDetailsList] = useState([]);

  const modalOpen = (param, bool) => {
    const setters = {
      detail: setIsModalOpen,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  useEffect(() => {
    const fetchTransaksiHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_store = localStorage.getItem("id_store");
        const id_company = localStorage.getItem("id_company");
        const response = await client.post(
          "/sales/transaksi-history",
          {
            id_store,
            id_company,
            filterBy,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /sales/transaksi-history:",
            data
          );
          setSalesReportList([]);
        } else {
          setSalesReportList(data);
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
        setSalesReportList([]);
      }
    };
    fetchTransaksiHistory();
  }, [filterBy]);
  useEffect(() => {
    const fetchTransaksiHistory = async () => {
      try {
        const token = localStorage.getItem('token')
        const id_store = localStorage.getItem("id_store");
        const id_company = localStorage.getItem("id_company");
        const response = await client.post("/order/transaksi-history", {
          id_store,
          id_company,
          filterBy,
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /sales/transaksi-history:",
            data
          );
          setOrderReportList([]);
        } else {
          setOrderReportList(data);
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
        setOrderReportList([]);
      }
    };
    fetchTransaksiHistory();
  }, [filterBy]);

  return (
    <div className="w-full h-screen pt-16">
      {/* Header */}
      <div className="justify-between w-full bg-white shadow-lg p-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">Reports</p>
            <p>Detail Reports</p>
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
      </div>
      {/* Reports content */}

      <div className="flex justify-between items-center mb-6 mt-3">
        <div>
          <select
            className="bg-white border border-gray-300 rounded-full px-4 py-2 focus:outline-none"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="flex items-center">
          <i className="fas fa-th-large text-gray-500 mr-4"></i>
          <i className="fas fa-th-list text-gray-500"></i>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4">Laporan Order</h3>
          <div className="space-y-4">
            {orderReportList.map((orl, index) => (
              <div className="flex justify-between items-center" key={index}>
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  <div>
                    <p className="font-bold">
                      {orl.person_name || "tidak ada nama"} #{index}
                    </p>
                    <p className="text-gray-500">
                      {new Date(orl.created_at).toLocaleString("id-ID", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <p className="text-gray-500 mr-4">
                    {orl.orderDetails.length || 0}
                  </p>
                  <p className="font-bold">
                    Rp.
                    {new Intl.NumberFormat("id-ID").format(
                      orl.total_price || 0
                    )}
                  </p>
                  <button
                    className="bg-yellow-500 text-white rounded-full px-4 py-1 ml-4"
                    onClick={() => {
                      setOrderDetailsList(orl);
                      modalOpen("detail", true);
                    }}
                  >
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4">Laporan Penjualan</h3>
          <div className="space-y-4">
            {salesReportList.map((sales, index) => {
              return (
                <div className="flex justify-between items-center" key={index}>
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    <div>
                      <p className="font-bold">Payment from {sales.name}</p>
                      <p className="text-gray-500">
                        {new Date(sales.created_at).toLocaleString("id-ID", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">
                    Rp.
                    {new Intl.NumberFormat("id-ID").format(
                      sales.total_price
                    )}{" "}
                    {sales.total_price === sales.total_price_after_all
                      ? ""
                      : `diskon menjadi Rp.${new Intl.NumberFormat(
                          "id-ID"
                        ).format(sales.total_price_after_all)}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <Modal onClose={() => modalOpen("detail", false)} title="Detail Order">
          <div class="bg-white rounded-lg shadow-lg border-t-2 border border-t-gray-300 p-6 w-full max-w-4xl">
            <div className="grid grid-cols-[auto_auto_1fr] gap-y-2 font-sans">
              <span className="text-left font-bold pr-2">No</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">1</span>
              {/*  */}
              <span className="text-left font-bold pr-2">No Order</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">{orderDetailsList.no}</span>
              {/*  */}
              <span className="text-left font-bold pr-2">Nama</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {orderDetailsList.person_name}
              </span>
              {/*  */}
              <span className="text-left font-bold pr-2">Order Code</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">{orderDetailsList.code}</span>
              {/*  */}
              <span className="text-left font-bold pr-2">Total Quantity</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {orderDetailsList.total_quantity}
              </span>
              {/*  */}
              <span className="text-left font-bold pr-2">Total Price</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {orderDetailsList.total_price}
              </span>
              {/*  */}
              <span className="text-left font-bold pr-2">Total Discount</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {orderDetailsList.orderDetails.length > 0
                  ? (
                      orderDetailsList.orderDetails.reduce(
                        (sum, d) => sum + d.discount,
                        0
                      ) / orderDetailsList.orderDetails.length
                    ).toFixed(2)
                  : 0}
                %
              </span>
              {/*  */}
              <span className="text-left font-bold pr-2">Deskripsi</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {orderDetailsList.keterangan}
              </span>
              {/*  */}
              <span className="text-left font-bold pr-2">Status</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                <div
                  className={` ${
                    orderDetailsList.status == 1 ? "bg-teal-300" : "bg-gray-200"
                  }
 py-1 px-3 rounded-full text-xs w-fit`}
                >
                  {orderDetailsList.status == 1 ? "Active" : "Pending"}
                </div>
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Report;
