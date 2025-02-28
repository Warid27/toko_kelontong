import client from "@/libs/axios"

export const fetchCompanyList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await client.post(
        "/company/listcompany",
        {}, // Pass id_store in the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data
      return data
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };