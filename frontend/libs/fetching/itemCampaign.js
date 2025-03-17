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

export const getItemCampaign = async (id_item_campaign) => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post(
      "/itemcampaign/getitemcampaign",
      { id: id_item_campaign },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error fetching item Campaign:", error);
  }
};

export const addItemCampaign = async (data) => {
  const token = localStorage.getItem("token");
  const response = await client.post("/itemcampaign/additemcampaign", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
};

export const updateItemCampaign = async (id, data) => {
  const token = localStorage.getItem("token");
  const response = await client.put(`/api/itemcampaign/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
};

export const deleteItemCampaign = async (id) => {
  const token = localStorage.getItem("token");
  const response = await client.delete(`/api/itemcampaign/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
};
