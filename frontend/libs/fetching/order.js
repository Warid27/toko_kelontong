import client from "@/libs/axios";

export const fetchOrderList = async (id_store = null, params = "filtered") => {
  try {
    const token = localStorage.getItem("token");

    // Conditionally construct the request body
    const requestBody = id_store !== null ? { id_store } : {};

    const response = await client.post(
      "/order/listorder",
      requestBody, // Use the conditionally constructed body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!Array.isArray(response.data)) {
      console.error("Unexpected response format:", response.data);
      return [];
    }

    let data;
    if (params == "filtered") {
      data = response.data.filter((order) => order.status === 2);
    } else if (params == "all") {
      data = response.data;
    }

    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

export const updateOrder = async (reqBody, orderId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.put(`api/order/${orderId}`, reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

export const addOrder = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = client.post("order/addorder", reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

export const fetchOrderTransaksiHistory = async (reqBody) => {
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
