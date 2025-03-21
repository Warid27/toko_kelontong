import client from "@/libs/axios";
import { tokenDecoded } from "@/utils/tokenDecoded";

export const fetchSalesCampaignList = async () => {
  try {
    const token = localStorage.getItem("token");
    const id_store = tokenDecoded().id_store ? tokenDecoded().id_store
    : localStorage.getItem("id_store");;
    const id_company = tokenDecoded().id_company
      ? tokenDecoded().id_company
      : localStorage.getItem("id_company");
    const response = await client.post(
      "/salescampaign/listsalescampaign",
      { id_company, id_store },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching salescampaigns:", error);
  }
};

export const addSalesCampaign = async (reqBody) => {
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

  const response = await client.post(
    "/salescampaign/addsalescampaign",
    reqBody,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response;
};

export const updateSalesCampaign = async (id, reqBody) => {
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

  const response = await client.put(`/api/salescampaign/${id}`, reqBody, {
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
