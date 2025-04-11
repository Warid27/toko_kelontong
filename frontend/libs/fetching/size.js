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
          "Error fetching size:", error
        );
        
      }
  }

  export const updateSize = async (requestBody) => {
    try {
      const token = localStorage.getItem("token");
      const response = await client.post(
        `/api/submit-size`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return response;
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  
  export const addSize = async (reqBody) => {
    try {
      const token = localStorage.getItem("token");
      const response = await client.post("/size/addsize", reqBody, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      return response;
    } catch (error) {
      console.error("Error add store:", error);
    }
  };

  export const deleteSize = async (id_size) => {
    try {
      const token = localStorage.getItem("token");
      const response = await client.delete(`/api/size/${id_size}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response;
    } catch (error) {
      console.error("Error update size:", error);
    }
  };