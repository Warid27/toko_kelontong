import client from "@/libs/axios";

export const fetchOrderList = async (id_store, token) => {
  try {
    // If id_store is missing but token exists, return an empty object
    if (!id_store && token) {
      return [];
    }

    // Construct the request payload
    const payload = id_store ? { id_store } : {};

    // Construct headers conditionally
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Make the POST request to fetch the order list
    const response = await client.post("/order/listorder", payload, {
      headers,
    });

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
