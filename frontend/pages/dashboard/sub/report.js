import React, { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import {
  MdKeyboardArrowDown,
  MdAnalytics,
  MdAttachMoney,
} from "react-icons/md";
import { FaRegCalendarAlt, FaChartLine, FaUsers } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import DatePickers from "@/components/DatePicker";
import { Modal } from "@/components/Modal";
import { formatNumber } from "@/utils/formatNumber";
import { fetchTransaksiHistory } from "@/libs/fetching/sales";
import { fetchOrderTransaksiHistory } from "@/libs/fetching/order";
import useUserStore from "@/stores/user-store";

export const Report = () => {
  const [salesReportList, setSalesReportList] = useState([]);
  const [orderReportList, setOrderReportList] = useState([]);
  const [filterBy, setFilterBy] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderDetailsList, setOrderDetailsList] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useUserStore();
  const id_store = userData?.id_store;
  const id_company = userData?.id_company;

  const modalOpen = (param, bool) => {
    const setters = {
      detail: setIsModalOpen,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  useEffect(() => {
    const TransaksiHistory = async () => {
      setIsLoading(true);
      try {
        const reqBody = {
          id_store,
          id_company,
          filterBy,
          selectedDate,
        };
        const response = await fetchTransaksiHistory(reqBody);
        const data = response.data;

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
      } finally {
        setIsLoading(false);
      }
    };
    TransaksiHistory();
  }, [filterBy, selectedDate, id_company, id_store]);

  useEffect(() => {
    const TransaksiHistory = async () => {
      setIsLoading(true);
      try {
        const reqBody = {
          id_store,
          id_company,
          filterBy,
          selectedDate,
        };
        const response = await fetchOrderTransaksiHistory(reqBody);
        const data = response.data;
        console.log("RESEPS", response);
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /order/transaksi-history:",
            data
          );
          setOrderReportList([]);
        } else {
          setOrderReportList(data);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setOrderReportList([]);
      } finally {
        setIsLoading(false);
      }
    };
    TransaksiHistory();
  }, [filterBy, selectedDate, id_company, id_store]);

  // Calculate total sales and orders
  const totalSales = salesReportList.reduce(
    (sum, sale) => sum + sale.total_price,
    0
  );
  const totalOrders = orderReportList.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-row justify-between"></div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mt-4"
      >
        <motion.div
          variants={cardVariants}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md border border-green-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <MdAttachMoney className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatNumber(totalSales)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-green-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-green-500 h-2 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">75% of monthly target</p>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-gray-700 rounded-lg">
              <FaUsers className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gray-700 h-2 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">60% of monthly target</p>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <FaChartLine className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatNumber(averageOrderValue)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-green-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-green-500 h-2 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">85% of monthly target</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-4"
      >
        <div className="w-full bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center"
              >
                <div className="relative">
                  <FaRegCalendarAlt className="absolute left-3 top-2.5 text-green-500" />
                  <select
                    className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent shadow-sm"
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <DatePickers
                  filterBy={filterBy}
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </motion.div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "all"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "orders"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setActiveTab("orders")}
              >
                Orders
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "sales"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setActiveTab("sales")}
              >
                Sales
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reports content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Order Report */}
          {(activeTab === "all" || activeTab === "orders") && (
            <motion.div
              variants={itemVariants}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <MdAnalytics className="mr-2 text-green-500" />
                  Order Analytics
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-green-500 text-sm font-medium"
                >
                  View All
                </motion.button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {console.log("ORDER REPORT LIST", orderReportList)}
                  <AnimatePresence>
                    {orderReportList.map((orl, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
                        className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-100 shadow-sm transition-all duration-200"
                      >
                        {console.log("OER EL", orl)}
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <span className="text-green-500 font-bold text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {orl.person_name || "Unknown"}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {new Date(orl.created_at).toLocaleString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-4">
                            <p className="text-gray-500 text-sm">Items</p>
                            <p className="font-bold text-gray-800">
                              {orl.orderDetails.length || 0}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500 text-sm">Total</p>
                            <p className="font-bold text-green-600">
                              {formatNumber(orl.total_price)}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="ml-4 px-4 py-1 bg-green-500 text-white rounded-lg text-sm flex items-center justify-center"
                            onClick={() => {
                              setOrderDetailsList(orl);
                              modalOpen("detail", true);
                            }}
                          >
                            Details
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {orderReportList.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No order data available
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Sales Report */}
          {(activeTab === "all" || activeTab === "sales") && (
            <motion.div
              variants={itemVariants}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <MdAttachMoney className="mr-2 text-green-500" />
                  Sales Analytics
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-green-500 text-sm font-medium"
                >
                  View All
                </motion.button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 ">
                  <AnimatePresence>
                    {salesReportList.map((sales, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
                        className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-100 shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <span className="text-green-500 font-bold text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              Payment from {sales.name}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {new Date(sales.created_at).toLocaleString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-sm">Amount</p>
                          <p className="font-bold text-green-600">
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(
                              sales.total_price
                            )}
                          </p>
                          {sales.total_price !==
                            sales.total_price_after_all && (
                            <p className="text-xs text-gray-500">
                              After discount: Rp{" "}
                              {new Intl.NumberFormat("id-ID").format(
                                sales.total_price_after_all
                              )}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {salesReportList.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No sales data available
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        <Modal
          isOpen={isModalOpen}
          onClose={() => modalOpen("detail", false)}
          title="Detail Order"
          width="large"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-xl shadow-lg border-t-2 border border-t-green-400 p-6 w-full max-w-4xl"
          >
            <div className="grid grid-cols-[auto_auto_1fr] gap-y-4 font-sans">
              <span className="text-left font-bold pr-2">No</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">1</span>

              <span className="text-left font-bold pr-2">Order No</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">{orderDetailsList.no}</span>

              <span className="text-left font-bold pr-2">Customer</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {orderDetailsList.person_name || "N/A"}
              </span>

              <span className="text-left font-bold pr-2">Order Code</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">{orderDetailsList.code}</span>

              <span className="text-left font-bold pr-2">Total Items</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {orderDetailsList.total_quantity || 0}
              </span>

              <span className="text-left font-bold pr-2">Total Price</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700 font-bold">
                Rp{" "}
                {new Intl.NumberFormat("id-ID").format(
                  orderDetailsList.total_price || 0
                )}
              </span>

              <span className="text-left font-bold pr-2">Discount</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {orderDetailsList.orderDetails &&
                orderDetailsList.orderDetails.length > 0
                  ? (
                      orderDetailsList.orderDetails.reduce(
                        (sum, d) => sum + d.discount,
                        0
                      ) / orderDetailsList.orderDetails.length
                    ).toFixed(2)
                  : 0}
                %
              </span>

              <span className="text-left font-bold pr-2">Notes</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                {orderDetailsList.keterangan || "No notes"}
              </span>

              <span className="text-left font-bold pr-2">Status</span>
              <span className="font-bold px-2">:</span>
              <span className="text-gray-700">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`${
                    orderDetailsList.status == 1
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  } py-1 px-4 rounded-full text-sm w-fit`}
                >
                  {orderDetailsList.status == 1 ? "Active" : "Pending"}
                </motion.div>
              </span>
            </div>

            {orderDetailsList.orderDetails &&
              orderDetailsList.orderDetails.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-gray-800 mb-3">Order Items</h4>
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">
                            Item
                          </th>
                          <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">
                            Price
                          </th>
                          <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">
                            Quantity
                          </th>
                          <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">
                            Discount
                          </th>
                          <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetailsList.orderDetails.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-3">
                              {item.name_product || "Item #" + (index + 1)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              Rp.{" "}
                              {new Intl.NumberFormat("id-ID").format(
                                item.price_item
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {item.discount}%
                            </td>
                            <td className="py-3 px-3 text-center font-medium">
                              Rp.{" "}
                              {new Intl.NumberFormat("id-ID").format(
                                item.price_item *
                                  item.quantity *
                                  (1 - item.discount / 100)
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md"
                onClick={() => modalOpen("detail", false)}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </Modal>
      </AnimatePresence>
    </div>
  );
};

export default Report;
