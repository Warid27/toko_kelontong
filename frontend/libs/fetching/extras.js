import client from "@/libs/axios";

export const fetchExtrasList = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/extras/listextras",
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
    console.error("Error fetching extras:", error);
  }
};

export const fetchExtrasGet = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/extras/getextras",
      { id: id }, // Use `data` for Axios payload
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching extras:", error);
  }
};
