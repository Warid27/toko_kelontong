import React, { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdKeyboardArrowDown, MdTrendingUp, MdTrendingDown, MdMenu, MdDashboard, MdOutlineAnalytics } from "react-icons/md";
import { FaUserAlt, FaChartLine, FaMoneyBillWave, FaShoppingBag, FaRegCalendarAlt } from "react-icons/fa";
import { FiActivity, FiBarChart2, FiUsers, FiDollarSign } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import DatePickers from "@/components/DatePicker";
import client from "@/libs/axios";
import SalesChart from "@/components/SalesChart";
import { formatNumber } from "@/utils/formatNumber";

export const Analytics = () => {
  const [bestSellingList, setBestSellingList] = useState([]);
  const [transaksiHistoryList, setTransaksiHistoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [filterBy, setFilterBy] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterRekapBy, setFilterRekapBy] = useState("aktif");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [sortBest, setSortBest] = useState(1);
  const [salesTodayData, setSalesTodayData] = useState(0);
  const [salesCountData, setSalesCountData] = useState(0);
  const [salesProfitData, setSalesProfitData] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const token = localStorage.getItem('token');

  // Your existing useEffect hooks for data fetching remain unchanged
  useEffect(() => {
    const fetchSalesTodayData = async () => {
      try {
        const id_store = localStorage.getItem("id_store");
        const id_company = localStorage.getItem("id_company");

        const response = await client.post("/sales/totalsales", {
          id_store,
          id_company,
          filterRekapBy,
          filterBy,
          selectedDate : selectedDate ? selectedDate.toISOString().split("T")[0] : null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        setSalesTodayData(data.data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setSalesTodayData(0);
      }
    };

    fetchSalesTodayData();
  }, [filterRekapBy, filterBy, selectedDate]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await client.post("/product/listproduct", {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;

        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /product/listproduct:",
            data
          );
          setProductList([]);
        } else {
          setProductList(data);
        }
      } catch (error) {
        console.error("Error fetching size:", error);
        setProductList([]);
      }
    };
    fetchProduct();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.post(
          "/user/listuser",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;

        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /user/listuser:", data);
          setUserList([]);
        } else {
          setUserList(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUserList([]);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchBestSelling = async () => {
      const id_store = localStorage.getItem("id_store");
      const id_company = localStorage.getItem("id_company");

      try {
        const payload = {
          filterBy: filterBy,
          sort: { total_quantity: parseInt(sortBest) },
          id_store: id_store,
          id_company: id_company,
          selectedDate : selectedDate ? selectedDate.toISOString().split("T")[0] : null
        };

        if (sortBest) {
          payload.sort = { total_quantity: parseInt(sortBest, 10) };
        }

        const response = await client.post("/sales/best-selling", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;
        console.log(data)
        setBestSellingList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sales:", error);
        setBestSellingList([]);
      }
    };
    fetchBestSelling();
  }, [filterBy, sortBest]);

  useEffect(() => {
    const fetchTransaksiHistory = async () => {
      try {
        const id_store = localStorage.getItem("id_store");
        const id_company = localStorage.getItem("id_company");
        const response = await client.post("/sales/transaksi-history", {
          id_store,
          id_company,
          filterBy,
          selectedDate
        },{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
        const data = response.data.data;

        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /sales/transaksi-history:",
            data
          );
          setTransaksiHistoryList([]);
        } else {
          setTransaksiHistoryList(data);
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
        setTransaksiHistoryList([]);
      }
    };
    fetchTransaksiHistory();
  }, [filterBy, selectedDate]);

  useEffect(() => {
    const fetchSalesCount = async () => {
      try {
        const id_store = localStorage.getItem("id_store");
        const id_company = localStorage.getItem("id_company");
        const response = await client.post("/sales/sales-count", {
          id_store,
          id_company,
          filterRekapBy,
          filterBy,
          selectedDate : selectedDate ? selectedDate.toISOString().split("T")[0] : null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
        const data = response.data;

        if (!data || typeof data.total_sales !== "number") {
          console.error("Unexpected data format:", data);
          setSalesCountData(0);
        } else {
          setSalesCountData(data.total_sales);
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
        setSalesCountData(0);
      }
    };
    fetchSalesCount();
  }, [filterRekapBy, filterBy, selectedDate]);

  useEffect(() => {
    const fetchProfit = async () => {
      try {
        const id_store = localStorage.getItem("id_store");
        const id_company = localStorage.getItem("id_company");
        const response = await client.post("/sales/profitsales", {
          id_store,
          id_company,
          filterRekapBy,
          filterBy,
          selectedDate : selectedDate ? selectedDate.toISOString().split("T")[0] : null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
        const data = response.data;

        if (!data.success) {
          console.error("Unexpected data format:", data);
          setSalesProfitData(0);
        } else {
          setSalesProfitData(data.total_profit);
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
        setSalesProfitData(0);
      }
    };
    fetchProfit();
  }, [filterRekapBy, filterBy, selectedDate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const cardVariants = {
    hover: { 
      scale: 1.03,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Main Content */}
      <div className={`transition-all duration-300`}>
        {/* Header */}
        <div className="bg-white shadow-md p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSidebar(!showSidebar)}
                className="mr-4 text-green-700"
              >
                <MdMenu className="text-2xl" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
                <p className="text-sm text-gray-500">Real-time performance insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-full w-64 focus:outline-none focus:border-green-500 transition-colors"
                />
                <IoSearchOutline className="absolute left-3 top-2.5 text-xl text-gray-500" />
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-500"
              >
                <Image
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  alt="avatar"
                  width={40}
                  height={40}
                />
              </motion.div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="text-gray-700"
              >
                <MdKeyboardArrowDown className="text-2xl" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Analytics Content */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="p-6"
        >
          {/* Filters */}
          <motion.div 
            variants={itemVariants} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
          >
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Time Period</label>
              <div className="relative">
                  <FaRegCalendarAlt className="absolute left-3 top-4 text-green-500" />
                  <select
                    className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent shadow-sm"
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Date</label>
              <DatePickers filterBy={filterBy} value={selectedDate} onChange={setSelectedDate} />
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status Filter</label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={filterRekapBy}
                onChange={(e) => setFilterRekapBy(e.target.value)}
              >
                <option value="aktif">Active</option>
                <option value="pending">Pending</option>
                <option value="semua">All</option>
              </select>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white"
          >
            <div className="flex justify-between mb-2">
              <p className="text-green-100 font-medium">Sales</p>
              <FiActivity className="text-white text-xl" />
            </div>
            <motion.h2 
              className="text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {salesCountData ? salesCountData : "0"}
            </motion.h2>
            <div className="mt-2 flex items-center text-sm">
              <FiBarChart2 className="mr-1" />
              <p>Total transactions</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex justify-between mb-2">
              <p className="text-gray-500 font-medium">Total Revenue</p>
              <FiDollarSign className="text-green-500 text-xl" />
            </div>
            <motion.h2 
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {formatNumber(salesTodayData ? salesTodayData : 0)}
            </motion.h2>
            <div className="mt-2 flex items-center text-sm text-green-500">
              <FiBarChart2 className="mr-1" />
              <p>Total Sales</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex justify-between mb-2">
              <p className="text-gray-500 font-medium">Return</p>
              <FiDollarSign className="text-green-500 text-xl" />
            </div>
            <motion.h2 
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {formatNumber(salesProfitData ? salesProfitData : 0)}
            </motion.h2>
            <div className="mt-2 flex items-center text-sm text-green-500">
              <FiBarChart2 className="mr-1" />
              <p>Total Return</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex justify-between mb-2">
              <p className="text-gray-500 font-medium">Marketing</p>
              <FiUsers className="text-green-500 text-xl" />
            </div>
            <motion.h2 
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Rp 5.566
            </motion.h2>
            <div className="mt-2 flex items-center text-sm text-green-500">
              <MdTrendingUp className="mr-1" />
              <p>15% increase</p>
            </div>
          </motion.div>
        </motion.div>
          {/* Charts */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            <motion.div 
              variants={cardVariants}
              whileHover="hover"
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2"
            >
              <h3 className="font-bold text-gray-800 mb-4">Performance Trends</h3>
              <div className="bg-white rounded-xl overflow-hidden">
                <SalesChart />
              </div>
            </motion.div>
            
            <motion.div 
              variants={cardVariants}
              whileHover="hover"
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-4">User Activity</h3>
              <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  📊 Bar Chart Placeholder
                </motion.div>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                  <span>Previous</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Top Products</h3>
                <select
                  className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={sortBest}
                  onChange={(e) => setSortBest(Number(e.target.value))}
                >
                  <option value="1">Worst Performing</option>
                  <option value="-1">Best Performing</option>
                </select>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">No</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestSellingList?.map((bsl, index) => {
                      const product = productList.find((pl) => pl._id === bsl._id);
                      return (
                        <motion.tr 
                          key={index}
                          custom={index}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-4 text-gray-800">{index + 1}</td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-800">{bsl.name}</div>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{product?.deskripsi || "No description"}</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                              {bsl.total_quantity}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-800">
                            Rp.{new Intl.NumberFormat("id-ID").format(bsl.item_price)}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-6">Transaction History</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {transaksiHistoryList?.map((thl, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 p-4 rounded-xl border-l-4 border-green-500 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        {thl.status == 1 ? (
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        ) : (
                          <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        )}
                        <p className="font-medium text-gray-800">
                          {userList.find((ul) => ul._id == thl.id_user)?.username || "User"}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${thl.status == 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {thl.status == 1 ? "Complete" : "Pending"}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <p className="font-bold text-gray-800">
                        Rp.{new Intl.NumberFormat("id-ID").format(thl.total_price)}
                        {thl.total_price === thl.total_price_after_all ? "" : (
                          <span className="text-sm font-normal text-green-600 ml-2">
                            (Discounted: Rp.{new Intl.NumberFormat("id-ID").format(thl.total_price_after_all)})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(thl.created_at).toLocaleString("id-ID", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;