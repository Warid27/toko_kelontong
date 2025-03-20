import client from "@/libs/axios";

export const fetchStoreList = async (id_company = null) => {
  try {
    const token = localStorage.getItem("token");

    if (!id_company) {
      id_company = localStorage.getItem("id_company");
    }

    if (!id_company) {
      return []; // Ensure it always returns an array
    }

    const response = await client.post(
      "/store/liststore",
      { id_company },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data || []; // Ensure we return an array
  } catch (error) {
    console.error("Error fetching store:", error);
    return []; // Return empty array to prevent crashes
  }
};

export const getStoreData = async (id) => {
  try {
    const token = localStorage.getItem("token");
    if (id != null) {
      const response = await client.post(
        "/store/getstore",
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 200) {
        const data = response.data;
        return data;
      } else {
        Swal.fire("Gagal", response.error, "error");
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching companies:", error);
  }
};

export const listStoreStatus = async () => {
  try {
    const response = await client.post("/store/liststatus", {});

    return response;
  } catch (error) {
    console.error("Error fetching stores:", error);
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

export const addStore = async (reqBody) => {
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

export const getStoreImage = async (id_store, params) => {
  try {
    const token = localStorage.getItem("token");
    if (!id_store) {
      console.error("id_store is missing");
      return;
    }
    const response = await client.post(
      `/store/getStoreImage`,
      { id: id_store, params: params },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const deleteStore = async (id_store) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.delete(`/api/store/${id_store}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error update store:", error);
  }
};
