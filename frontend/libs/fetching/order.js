import client from "@/libs/axios";

export const fetchOrderList = async () => {
  try {
    const id_store = localStorage.getItem("id_store");
    const token = localStorage.getItem("token");
    // Make the POST request to fetch the order list
    const response = await client.post(
      "/order/listorder",
      { id_store },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Validate response format
    if (!Array.isArray(response.data)) {
      console.error("Unexpected response format:", response.data);
      return [];
    }

    // Filter orders with status === 2 (ensure numeric comparison)
    return response.data.filter((order) => order.status === 2);
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error; // Optionally, return [] instead of throwing an error
  }
};
