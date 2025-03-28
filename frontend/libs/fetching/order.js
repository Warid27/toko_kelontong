import client from "@/libs/axios";

export const fetchOrderList = async (id_store) => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post(
      "/order/listorder",
      { id_store },
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

    return response.data.filter((order) => order.status === 2);
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
