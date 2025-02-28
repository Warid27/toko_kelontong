import client from "@/libs/axios"

export const fetchTableList = async () => {
    try {
      const response = await client.get("/table/listtable");
      const data = response.data;

      return data
    } catch (error) {
      console.error("Error fetching table:", error);
    }
  };