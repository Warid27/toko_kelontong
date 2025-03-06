import client from "@/libs/axios"

export const fetchTableList = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await client.post("/table/listtable", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      return data
    } catch (error) {
      console.error("Error fetching table:", error);
    }
  };