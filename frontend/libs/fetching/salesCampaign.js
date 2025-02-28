import client from "@/libs/axios"

export const fetchSalesCampaignList = async () => {
    try {
        const token = localStorage.getItem('token')
        const id_store = localStorage.getItem("id_store")
      const response = await client.post(
        "/salescampaign/listsalescampaign",
        {},
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