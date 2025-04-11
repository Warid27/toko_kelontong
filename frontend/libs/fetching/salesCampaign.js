import client from "@/libs/axios";

export const fetchSalesCampaignList = async (id_store) => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post(
      "/salescampaign/listsalescampaign",
      { id_store },
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
