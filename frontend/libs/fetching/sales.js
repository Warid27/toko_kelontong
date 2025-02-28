import client from "@/libs/axios"

export const fetchSalesList = async () => {
    try {
      const id_store = localStorage.getItem("id_store");
      const token = localStorage.getItem('token')
      const response = await client.post(
        "/sales/listsales",
        { id_store }, // Pass id_store in the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data
      return data
    } catch (error) {
      console.error("Error fetching saleses:", error);
    }
  };