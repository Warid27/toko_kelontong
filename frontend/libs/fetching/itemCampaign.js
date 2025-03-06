import client from "@/libs/axios";

export const fetchItemCampaignList = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post(
      "/itemcampaign/listitemcampaigns",
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
    console.error("Error fetching item Campaign:", error);
  }
};
