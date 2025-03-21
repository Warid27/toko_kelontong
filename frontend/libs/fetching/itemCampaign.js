import client from "@/libs/axios";
import { tokenDecoded } from "@/utils/tokenDecoded";
export const fetchItemCampaignList = async () => {
  try {
    const token = localStorage.getItem("token");
    const id_store = tokenDecoded().id_store ? tokenDecoded().id_store
    : localStorage.getItem("id_store");
    const id_company = tokenDecoded().id_company ? tokenDecoded().id_company
    : localStorage.getItem("id_company");

    const response = await client.post(
      "/itemcampaign/listitemcampaigns",
      {id_company, id_store},
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

export const addItemCampaign = async (reqBody) => {
  const token = localStorage.getItem("token");

  const userData = await tokenDecoded();

  if (userData) {
    reqBody.id_user = userData.id;
    reqBody.id_store = userData.id_store
      ? userData.id_store
      : localStorage.getItem("id_store");
    reqBody.id_company = userData.id_company
      ? userData.id_company
      : localStorage.getItem("id_company");
  }

  const response = await client.post("/itemcampaign/additemcampaign", reqBody, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
};

export const updateItemCampaign = async (id, reqBody) => {
  const token = localStorage.getItem("token");
  const userData = await tokenDecoded();

  if (userData) {
    reqBody.id_user = userData.id;
    reqBody.id_store = userData.id_store
      ? userData.id_store
      : localStorage.getItem("id_store");
    reqBody.id_company = userData.id_company
      ? userData.id_company
      : localStorage.getItem("id_company");
  }

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
