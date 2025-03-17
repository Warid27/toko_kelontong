import client from "@/libs/axios";

export const fetchOrderList = async () => {
  try {
    const id_store = localStorage.getItem("id_store");
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
