// import React, { useState, useEffect } from "react";
// import { IoSearchOutline } from "react-icons/io5";
// import Image from "next/image";
// import { MdKeyboardArrowDown } from "react-icons/md";
// // import DateTimePicker from "@/components/DateTimePicker";
// import DatePickers from "@/components/DatePicker";
// import client from "@/libs/axios";
// import SalesChart from "@/components/SalesChart";
// import { formatNumber } from "@/utils/formatNumber";

// export const Analytics = () => {
//   const [bestSellingList, setBestSellingList] = useState([]);
//   const [transaksiHistoryList, setTransaksiHistoryList] = useState([]);
//   const [productList, setProductList] = useState([]);
//   const [userList, setUserList] = useState([]);
//   const [filterBy, setFilterBy] = useState("daily");
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [filterRekapBy, setFilterRekapBy] = useState("aktif");

//   const [startDate, setStartDate] = useState(new Date());
//   const [endDate, setEndDate] = useState(new Date());
//   const [sortBest, setSortBest] = useState(1);
//   const [salesTodayData, setSalesTodayData] = useState(0);
//   // const [salesPersenData, setSalesPersenData] = useState(0);
//   const [salesCountData, setSalesCountData] = useState(0);
//   const [salesProfitData, setSalesProfitData] = useState(0);
//   const token = localStorage.getItem('token')

//   useEffect(() => {
//     const fetchSalesTodayData = async () => {
//       try {
//         const id_store = localStorage.getItem("id_store");
//         const id_company = localStorage.getItem("id_company");

//         // const response = await client.get("/sales/sales-today");
//         const response = await client.post("/sales/totalsales", {
//           id_store,
//           id_company,
//           filterRekapBy,
//           filterBy,
//           selectedDate : selectedDate ? selectedDate.toISOString().split("T")[0] : null
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const data = response.data;
//         // const datatoday = parseInt(response.data.data[0]?.total_sales || 0);
//         // const datayesterday = parseInt(response.data.data[1]?.total_sales || 0);

//         // // Mencegah NaN atau Infinity
//         // const datapersen =
//         //   datayesterday !== 0
//         //     ? ((datatoday - datayesterday) / datayesterday) * 100
//         //     : datatoday > 0
//         //     ? 100
//         //     : 0;

//         setSalesTodayData(data.data);
//         // setSalesPersenData(datapersen.toFixed(2));
//       } catch (error) {
//         console.error("Error fetching sales data:", error);
//         setSalesTodayData(0);
//         // setSalesPersenData(0);
//       }
//     };

//     fetchSalesTodayData();
//   }, [filterRekapBy, filterBy, selectedDate]);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await client.post("/product/listproduct", {},
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         const data = response.data;

//         // Validate that the response is an array
//         if (!Array.isArray(data)) {
//           console.error(
//             "Unexpected data format from /product/listproduct:",
//             data
//           );
//           setProductList([]);
//         } else {
//           setProductList(data);
//         }
//       } catch (error) {
//         console.error("Error fetching size:", error);
//         setProductList([]);
//       }
//     };
//     fetchProduct();
//   }, []);
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await client.post(
//           "/user/listuser",
//           {},
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         const data = response.data;

//         // Validate that the response is an array
//         if (!Array.isArray(data)) {
//           console.error("Unexpected data format from /user/listuser:", data);
//           setUserList([]);
//         } else {
//           setUserList(data);
//         }
//       } catch (error) {
//         console.error("Error fetching user:", error);
//         setUserList([]);
//       }
//     };
//     fetchUser();
//   }, []);
//   // const mulaiPertama = async () => {
//   //   const response = await client.post("/sales/best-selling", {
//   //     start_date: startDate,
//   //     end_date: endDate,
//   //   });
//   // }
//   // if(startDate && endDate) {
//   //   mulaiPertama()
//   // }

//   useEffect(() => {
//     const fetchBestSelling = async () => {
//       const id_store = localStorage.getItem("id_store");
//       const id_company = localStorage.getItem("id_company");
//       if (!startDate || !endDate) {
//         const response = await client.post("/sales/best-selling", {
//           filterBy: filterBy,
//           id_store: id_store,
//           id_company: id_company,
//           // sort : sortBest
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//         const data = response.data.data;
//         setBestSellingList(Array.isArray(data) ? data : []);
//         return;
//       }

//       try {
//         const payload = {
//           filterBy: filterBy,
//           sort: { total_quantity: parseInt(sortBest) },
//           id_store: id_store,
//           id_company: id_company,
//         };

//         if (sortBest) {
//           payload.sort = { total_quantity: parseInt(sortBest, 10) };
//         }

//         const response = await client.post("/sales/best-selling", payload, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const data = response.data.data;
//         setBestSellingList(Array.isArray(data) ? data : []);
//       } catch (error) {
//         console.error("Error fetching sales:", error);
//         setBestSellingList([]);
//       }
//     };
//     fetchBestSelling();
//   }, [filterBy, sortBest]);
//   useEffect(() => {
//     const fetchTransaksiHistory = async () => {
//       try {
//         const id_store = localStorage.getItem("id_store");
//         const id_company = localStorage.getItem("id_company");
//         const response = await client.post("/sales/transaksi-history", {
//           id_store,
//           id_company,
//           filterBy,
//           selectedDate
//         },{
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//         const data = response.data.data;

//         // Validate that the response is an array
//         if (!Array.isArray(data)) {
//           console.error(
//             "Unexpected data format from /sales/transaksi-history:",
//             data
//           );
//           setTransaksiHistoryList([]);
//         } else {
//           setTransaksiHistoryList(data);
//         }
//       } catch (error) {
//         console.error("Error fetching sales:", error);
//         setTransaksiHistoryList([]);
//       }
//     };
//     fetchTransaksiHistory();
//   }, [filterBy, selectedDate]);
//   useEffect(() => {
//     const fetchSalesCount = async () => {
//       try {
//         const id_store = localStorage.getItem("id_store");
//         const id_company = localStorage.getItem("id_company");
//         const response = await client.post("/sales/sales-count", {
//           id_store,
//           id_company,
//           filterRekapBy,
//           filterBy,
//           selectedDate : selectedDate ? selectedDate.toISOString().split("T")[0] : null
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//         const data = response.data;

//         // Validate that the response is an array
//         if (!data || typeof data.total_sales !== "number") {
//           console.error("Unexpected data format:", data);
//           setSalesCountData(0);
//         } else {
//           setSalesCountData(data.total_sales);
//         }
//       } catch (error) {
//         console.error("Error fetching sales:", error);
//         setSalesCountData(0);
//       }
//     };
//     fetchSalesCount();
//   }, [filterRekapBy, filterBy, selectedDate]);
//   useEffect(() => {
//     const fetchProfit = async () => {
//       try {
//         const id_store = localStorage.getItem("id_store");
//         const id_company = localStorage.getItem("id_company");
//         const response = await client.post("/sales/profitsales", {
//           id_store,
//           id_company,
//           filterRekapBy,
//           filterBy,
//           selectedDate : selectedDate ? selectedDate.toISOString().split("T")[0] : null
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//         const data = response.data;

//         // Validate that the response is an array
//         if (!data.success) {
//           console.error("Unexpected data format:", data);
//           setSalesProfitData(0);
//         } else {
//           setSalesProfitData(data.total_profit);
//         }
//       } catch (error) {
//         console.error("Error fetching sales:", error);
//         setSalesProfitData(0);
//       }
//     };
//     fetchProfit();
//   }, [filterRekapBy, filterBy, selectedDate]);
//   return (
//     <div className="w-full h-screen pt-16">
//       {/* Header */}
//       <div className="justify-between w-full bg-white shadow-lg p-4">
//         <div className="flex flex-row justify-between">
//           <div className="flex flex-col">
//             <p className="text-2xl font-bold">Analitycs</p>
//             <p>Detail Analitycs</p>
//           </div>
//           <div className="relative mt-2 flex flex-row space-x-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search anything here"
//                 className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs"
//               />
//               <IoSearchOutline className="absolute left-2 top-2.5 text-xl text-gray-500" />
//             </div>
//             <div className="avatar">
//               <div className="w-10 h-10 rounded-full">
//                 <Image
//                   src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
//                   alt="avatar"
//                   width={40}
//                   height={40}
//                 />
//               </div>
//             </div>
//             <button className="button btn-ghost btn-sm rounded-lg">
//               <MdKeyboardArrowDown className="text-2xl mt-1" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Analytics content */}
//       <div className="p-4">
//         <select
//           className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//           value={filterBy}
//           onChange={(e) => setFilterBy(e.target.value)}
//         >
//           <option value="daily">Daily</option>
//           <option value="monthly">Monthly</option>
//           <option value="yearly">Yearly</option>
//         </select>
//         <DatePickers filterBy={filterBy} value={selectedDate} onChange={setSelectedDate} />
//         <main className="flex-1 p-6">
//           <select
//             className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             value={filterRekapBy}
//             onChange={(e) => setFilterRekapBy(e.target.value)}
//           >
//             <option value="aktif">Aktif</option>
//             <option value="pending">Pending</option>
//             <option value="semua">Semua</option> // APA CA
//           </select>
//           <div className="grid grid-cols-4 gap-4 mb-6">
//             <div className="bg-white p-4 rounded-lg shadow-md text-center">
//               <p className="text-gray-500">Sales</p>
//               <h2 className="text-lg font-bold">{salesCountData ? salesCountData : "0"}</h2>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-md text-center">
//               <p className="text-gray-500">Total Revenue</p>
//               <h2 className="text-lg font-bold">
//                 {formatNumber(parseInt(salesTodayData? salesTodayData: 0))}
//                 {/* <span
//                   className={`ml-2 ${
//                     salesPersenData >= 0 ? "text-green-500" : "text-red-500"
//                   }`}
//                 >
//                   {salesPersenData >= 0
//                     ? `+${salesPersenData}%`
//                     : `${salesPersenData}%`}
//                 </span> */}
//               </h2>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-md text-center">
//               <p className="text-gray-500">Return</p>
//               <h2 className="text-lg font-bold">
//                 {formatNumber(salesProfitData ? salesProfitData : 0)}
//               </h2>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-md text-center">
//               <p className="text-gray-500">Marketing</p>
//               <h2 className="text-lg font-bold">
//                 Rp 5.566 <span className="text-green-500">+15%</span>
//               </h2>
//             </div>
//           </div>

//           <div className="grid grid-cols-3 gap-4">
//             <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
//               {/* <h3 className="font-bold mb-2">Performance</h3> */}
//               {/* <div className="h-60 flex items-center justify-center"> */}
//               <SalesChart />
//               {/* </div> */}
//             </div>
//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <h3 className="font-bold mb-2">User Activity</h3>
//               <div className="h-40 bg-gray-200 flex items-center justify-center">
//                 📊 Bar Chart Placeholder
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-3 gap-4 mt-6">
//             <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
//               <h3 className="font-bold mb-2">Selling</h3>
//               <select
//                 className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 value={sortBest}
//                 onChange={(e) => setSortBest(Number(e.target.value))}
//                 required
//               >
//                 <option value="1">Bad</option>
//                 <option value="-1">Best</option>
//               </select>
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b">
//                     <th className="text-left p-2">No</th>
//                     <th className="text-left p-2">Menu</th>
//                     <th className="text-left p-2">Deskripsi</th>
//                     <th className="text-left p-2">Total Quantity</th>
//                     <th className="text-left p-2">Harga</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {bestSellingList?.map((bsl, index) => {
//                     const product = productList.find((pl) => pl._id == bsl._id);
//                     return (
//                       <tr className="border-b" key={index}>
//                         <td className="p-2">{index + 1}</td>
//                         <td className="p-2">{bsl.name}</td>
//                         <td className="p-2">
//                           {product?.deskripsi || "No description"}
//                         </td>
//                         <td className="p-2">{bsl.total_quantity}</td>
//                         <td className="p-2">
//                           Rp.
//                           {new Intl.NumberFormat("id-ID").format(
//                             bsl.item_price
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//             <div className="bg-white p-5 rounded-lg shadow-md">
//               <h3 className="font-bold mb-2">Transaction History</h3>
//               <div className="space-y-2 max-h-80 overflow-y-auto">
//                 {transaksiHistoryList?.map((thl, index) => (
//                   <div className=" justify-between border-b pb-2" key={index}>
//                     <p>
//                       {thl.status == 1 ? "✅" : "🔄"} Payment By :{" "}
//                       {userList.find((ul) => ul._id == thl.id_user)?.username}
//                     </p>
//                     <p className="font-bold">
//                       Rp.
//                       {new Intl.NumberFormat("id-ID").format(
//                         thl.total_price
//                       )}{" "}
//                       {thl.total_price === thl.total_price_after_all
//                         ? ""
//                         : `Mendapat diskon menjadi Rp.${new Intl.NumberFormat(
//                             "id-ID"
//                           ).format(thl.total_price_after_all)}`}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {new Date(thl.created_at).toLocaleString("id-ID", {
//                         weekday: "long",
//                         day: "2-digit",
//                         month: "long",
//                         year: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </main>

//         {/* Your analytics dashboard content goes here */}
//       </div>
//     </div>
//   );
// };

// export default Analytics;
