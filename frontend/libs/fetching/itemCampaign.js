import client from "@/libs/axios";

export const fetchItemCampaignList = async (
  id_store = null,
  id_company = null
) => {
  try {
    const token = localStorage.getItem("token");

    const reqBody = {};
    if (id_store) reqBody.id_store = id_store;
    if (id_company) reqBody.id_company = id_company;

    const response = await client.post(
      "/itemcampaign/listitemcampaigns",
      reqBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching item Campaign:", error);
    return null;
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

export const addItemCampaign = async (reqBody) => {
  const token = localStorage.getItem("token");

  const response = await client.post("/itemcampaign/additemcampaign", reqBody, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
};

export const updateItemCampaign = async (id, reqBody) => {
  const token = localStorage.getItem("token");

  const response = await client.put(`/api/itemcampaign/${id}`, reqBody, {
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
