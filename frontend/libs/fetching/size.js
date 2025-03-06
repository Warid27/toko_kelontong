import client from "@/libs/axios"

export const fetchSizeList = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await client.post("/size/listsize",{}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      return data
    } catch (error) {
      console.error("Error fetching size:", error);
    }
  };

  export const fetchSizeGet = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await client.post(
          "/size/getsize",
          { id: id }, // Use `data` for Axios payload
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data
        return data
      } catch (error) {
        console.error(
          "Error fetching extras:", error
        );
        
      }
  }