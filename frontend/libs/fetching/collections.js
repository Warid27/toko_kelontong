import client from "@/libs/axios"

export const fetchCollectionList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await client.post(
        "/api/collections",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = response.data;
      return data;
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };