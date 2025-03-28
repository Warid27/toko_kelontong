import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { formatNumber } from "@/utils/formatNumber";
import { fetchSalesChart } from "@/libs/fetching/sales";

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const SalesChart = ({ userData }) => {
  const [salesData, setSalesData] = useState([]);
  const id_company = userData?.id_company;
  const id_store = userData?.id_store;

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const reqBody = {
          id_store,
          id_company,
          limit: 5,
          sortni: 1,
        };
        const response = await fetchSalesChart(reqBody);
        const data = response.data; //

        const formattedData = data.map((item) => ({
          date: item._id,
          total: item.total_sales, // Total harga
        }));

        setSalesData(formattedData);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchSalesData();
  }, [id_company, id_store]);

  return (
    <div>
      <h3 className="font-bold mb-2">Chart Sales</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={salesData ? salesData : ""}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          {/* <YAxis tickFormatter={formatRupiah} /> */}
          <YAxis tickFormatter={formatNumber} />
          <Tooltip formatter={(value) => formatNumber(value)} />
          {/* <Tooltip formatter={(value) => formatRupiah(value)} /> */}
          <Line
            type="monotone"
            dataKey="total"
            stroke="#4CAF50"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
