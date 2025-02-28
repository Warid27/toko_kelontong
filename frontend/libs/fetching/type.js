import client from "@/libs/axios"

export const fetchTypeList = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await client.post("/type/listtype", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      return data
    } catch (error) {
      console.error("Error fetching type:", error);
    }
  };
export const fetchTypeAdd = async (type) => {
    try {
      const token = localStorage.getItem('token')
      const response = await client.post("/type/addtype", {type}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      return data
    } catch (error) {
      console.error("Error fetching type:", error);
    }
  };