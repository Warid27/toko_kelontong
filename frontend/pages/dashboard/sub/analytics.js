import React, { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import DateTimePicker from "@/components/DateTimePicker";
import client from "@/libs/axios";
import SalesChart from "@/components/SalesChart";
import { formatNumber } from "@/utils/formatNumber";

export const Analytics = () => {
  const [bestSellingList, setBestSellingList] = useState([]);
  const [transaksiHistoryList, setTransaksiHistoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [userList, setUserList] = useState([]);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [sortBest, setSortBest] = useState(1);
  const [salesTodayData, setSalesTodayData] = useState(0);
  const [salesPersenData, setSalesPersenData] = useState(0);

  useEffect(() => {
    const fetchSalesTodayData = async () => {
      try {
        const id_store = localStorage.getItem("id_store");
        const id_company = localStorage.getItem("id_company");
        // const response = await client.get("/sales/sales-today");
        const response = await client.post("/sales/sales-today", {
          id_store,
          id_company,
        });
        const datatoday = parseInt(response.data.data[0]?.total_sales || 0);
        const datayesterday = parseInt(response.data.data[1]?.total_sales || 0);

        // Mencegah NaN atau Infinity
        const datapersen =
          datayesterday !== 0
            ? ((datatoday - datayesterday) / datayesterday) * 100
            : datatoday > 0
            ? 100
            : 0;

        setSalesTodayData(datatoday);
        setSalesPersenData(datapersen.toFixed(2));
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setSalesTodayData(0);
        setSalesPersenData(0);
      }
    };

    fetchSalesTodayData();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await client.post("/product/listproduct", {});
        const data = response.data;

        // Validate that the response is an array
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
        const token = localStorage.getItem("token")
        const response = await client.post("/user/listuser", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;

        // Validate that the response is an array
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
  // const mulaiPertama = async () => {
  //   const response = await client.post("/sales/best-selling", {
  //     start_date: startDate,
  //     end_date: endDate,
  //   });
  // }
  // if(startDate && endDate) {
  //   mulaiPertama()
  // }

  useEffect(() => {
    const fetchBestSelling = async () => {
      const id_store = localStorage.getItem("id_store");
      const id_company = localStorage.getItem("id_company");
      if (!startDate || !endDate) {
        const response = await client.post("/sales/best-selling", {
          start_date: new Date(new Date().setDate(new Date().getDate() - 1)),
          end_date: new Date(),
          id_store: id_store,
          id_company: id_company,
          // sort : sortBest
        });
        const data = response.data.data;
        setBestSellingList(Array.isArray(data) ? data : []);
        return;
      }

      try {
        const payload = {
          start_date: startDate,
          end_date: endDate,
          sort: { total_quantity: parseInt(sortBest) },
          id_store: id_store,
          id_company: id_company,
        };

        if (sortBest) {
          payload.sort = { total_quantity: parseInt(sortBest, 10) };
        }

        const response = await client.post("/sales/best-selling", payload);
        const data = response.data.data;
        setBestSellingList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sales:", error);
        setBestSellingList([]);
      }
    };
    fetchBestSelling();
  }, [startDate, endDate, sortBest]);
  useEffect(() => {
    const fetchTransaksiHistory = async () => {
      try {
        const id_store = localStorage.getItem("id_store")
        const id_company = localStorage.getItem("id_company")
        const response = await client.post("/sales/transaksi-history", {
          id_store,
          id_company
        });
        const data = response.data.data;

        // Validate that the response is an array
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
  }, []);
  return (
    <div className="w-full h-screen pt-10 ">
      {/* <div className="bg-white shadow-lg w-full flex flex-row p-2 justify-between">
        <div className="flex flex-col">
          <p className="text-2xl font-bold">Analytics</p>
          <p>Detailed information about your store</p>
        </div>
      </div> */}

      {/* Analytics content */}
      <div className="p-4">
        <main class="flex-1 p-6">
          <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow-md text-center">
              <p class="text-gray-500">Sales</p>
              <h2 class="text-lg font-bold">
                {formatNumber(parseInt(salesTodayData))}
                <span
                  class={`ml-2 ${
                    salesPersenData >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {salesPersenData >= 0
                    ? `+${salesPersenData}%`
                    : `${salesPersenData}%`}
                </span>
              </h2>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-md text-center">
              <p class="text-gray-500">Total Revenue</p>
              <h2 class="text-lg font-bold">
                Rp 10.566 <span class="text-green-500">+35%</span>
              </h2>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-md text-center">
              <p class="text-gray-500">Return</p>
              <h2 class="text-lg font-bold">
                Rp 956 <span class="text-red-500">-5%</span>
              </h2>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-md text-center">
              <p class="text-gray-500">Marketing</p>
              <h2 class="text-lg font-bold">
                Rp 5.566 <span class="text-green-500">+15%</span>
              </h2>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="bg-white p-6 rounded-lg shadow-md col-span-2">
              {/* <h3 class="font-bold mb-2">Performance</h3> */}
              {/* <div class="h-60 flex items-center justify-center"> */}
              <SalesChart />
              {/* </div> */}
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="font-bold mb-2">User Activity</h3>
              <div class="h-40 bg-gray-200 flex items-center justify-center">
                📊 Bar Chart Placeholder
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mt-6">
            <div class="bg-white p-6 rounded-lg shadow-md col-span-2">
              <DateTimePicker
                options={{ dateFormat: "Y-m-d" }}
                name="start"
                classname="border border-gray-300 rounded p-1 w-28 bg-white text-center"
                onChange={(date) =>
                  date && setStartDate(date.toISOString().split("T")[0])
                }
              />{" "}
              -{" "}
              <DateTimePicker
                options={{ dateFormat: "Y-m-d", minDate: startDate }}
                name="end"
                classname="border border-gray-300 rounded p-1 w-28 bg-white text-center"
                onChange={(date) =>
                  date && setEndDate(date.toISOString().split("T")[0])
                }
              />
              <h3 class="font-bold mb-2">Selling</h3>
              <select
                className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={sortBest}
                onChange={(e) => setSortBest(Number(e.target.value))}
                required
              >
                <option value="1">Bad</option>
                <option value="-1">Best</option>
              </select>
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left p-2">No</th>
                    <th class="text-left p-2">Menu</th>
                    <th class="text-left p-2">Deskripsi</th>
                    <th class="text-left p-2">Total Quantity</th>
                    <th class="text-left p-2">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellingList.map((bsl, index) => {
                    const product = productList.find((pl) => pl._id == bsl._id);
                    return (
                      <tr className="border-b" key={index}>
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">{bsl.name}</td>
                        <td className="p-2">
                          {product?.deskripsi || "No description"}
                        </td>
                        <td className="p-2">{bsl.total_quantity}</td>
                        <td className="p-2">
                          Rp.
                          {new Intl.NumberFormat("id-ID").format(
                            bsl.item_price
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">Transaction History</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {transaksiHistoryList.map((thl, index) => (
                  <div className=" justify-between border-b pb-2" key={index}>
                    <p>
                      {thl.status == 1 ? "✅" : "🔄"} Payment By :{" "}
                      {userList.find((ul) => ul._id == thl.id_user)?.username}
                    </p>
                    <p className="font-bold">
                      Rp.
                      {new Intl.NumberFormat("id-ID").format(thl.total_price)}
                    </p>
                    <p className="text-sm text-gray-500">
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
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Your analytics dashboard content goes here */}
      </div>
    </div>
  );
};

export default Analytics;
