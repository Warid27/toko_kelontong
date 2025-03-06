import client from "@/libs/axios";

export const fetchStoreList = async () => {
  try {
    const token = localStorage.getItem("token");
    const id_company = localStorage.getItem("id_company");
    const response = await client.post(
      "/store/liststore",
      { id_company },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error fetching store:", error);
  }
};
export const updateStore = async (id_store, reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.put(`/api/store/${id_store}`, reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching store:", error);
  }
};

export const addStore = async (id_store, reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/store/addstore", reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response;
  } catch (error) {
    console.error("Error fetching store:", error);
  }
};
