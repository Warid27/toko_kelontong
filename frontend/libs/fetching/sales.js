import client from "@/libs/axios";

export const fetchSalesList = async (id_store) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/sales/listsales",
      { id_store },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("RESEPS", response)
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching saleses:", error);
  }
};

export const fetchSalesChart = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/sales/sales-chart", reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching saleses:", error);
  }
};

export const fetchBestSelling = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/sales/best-selling", reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching saleses:", error);
  }
};

export const fetchSalesTodayData = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/sales/totalsales", reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching saleses:", error);
  }
};

export const fetchSalesProfit = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/sales/profitsales", reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching saleses:", error);
  }
};

export const fetchSalesCount = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/sales/sales-count", reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching saleses:", error);
  }
};

export const fetchTransaksiHistory = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/sales/transaksi-history", reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching saleses:", error);
  }
};

export const addSales = async (salesData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/sales/addsales", salesData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching saleses:", error);
  }
};

export const updateSalesStatus = async (id, data) => {
  const token = localStorage.getItem("token");
  const response = await client.put(`/api/sales/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
};
