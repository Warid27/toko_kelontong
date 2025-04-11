import client from "@/libs/axios";

export const fetchTypeAdd = async (type) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token not found");

    const response = await client.post(
      "/type/addtype",
      { type },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding type:", error.message);
    throw error; // Lempar error agar bisa ditangkap di pemanggilnya
  }
};

export const updateType = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token not found");

    const response = await client.put(
      `/api/type/${typeDataUpdate.id}`,
      reqBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding type:", error.message);
    throw error; // Lempar error agar bisa ditangkap di pemanggilnya
  }
};

export const fetchTypeList = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/type/listtype",
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
    console.error("Error fetching type:", error);
  }
};

export const fetchListType = async () => {
  try {
    const response = await client.post("/type/list", {});
    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error fetching type:", error);
  }
};

export const deleteType = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.delete(`/api/type/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error fetching type:", error);
  }
};
