import client from "@/libs/axios"

export const fetchSalesCampaignList = async () => {
    try {
        const token = localStorage.getItem('token')
        const id_store = localStorage.getItem("id_store")
      const response = await client.post(
        "/salescampaign/listsalescampaign",
        {id_store},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;

      return data
    } catch (error) {
      console.error("Error fetching salescampaigns:", error);
    }
  };

  export const addSalesCampaign = async (data) => {
    const token = localStorage.getItem("token");
    const response = await client.post("/salescampaign/addsalescampaign", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  };
  
  export const updateSalesCampaign = async (id, data) => {
    const token = localStorage.getItem("token");
    const response = await client.put(`/api/salescampaign/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  };
  
  export const deleteSalesCampaign = async (id) => {
    const token = localStorage.getItem("token");
    const response = await client.delete(`/api/salescampaign/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  };