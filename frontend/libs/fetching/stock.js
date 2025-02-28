import client from "@/libs/axios"

export const fetchStockList = async () => {
    try {
        const token = localStorage.getItem('token')
        const id_store =
        localStorage.getItem("id_store") == "undefined"
        ? null
        : localStorage.getItem("id_store");
      const response = await client.post(
        "/stock/liststock",
        {
          id_store,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      return data
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } 
  };