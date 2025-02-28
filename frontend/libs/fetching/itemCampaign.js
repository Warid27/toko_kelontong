import client from "@/libs/axios"

export const fetchItemCampaignList = async () => {
    try {
      const response = await client.post(
        "/itemcampaign/listitemcampaigns",
        {}
      );
      const data = response.data;
      return data
    } catch (error) {
      console.error("Error fetching item Campaign:", error);
    }
  };