import client from "@/libs/axios"

export const fetchStoreList = async () => {
    try {
      const id_company = localStorage.getItem('id_company') // yud yud
      const response = await client.post("/store/liststore", {id_company});//manuk e wrid gedi 
      const data = response.data;//endog e warid gede sebelah

      return data
    } catch (error) {
      console.error("Error fetching store:", error);
    }
  };