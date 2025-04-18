import client from "@/libs/axios";

export const fetchPembelianList = async (id_store) => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post(
      "/pembelian/listpembelian",
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
    console.error("Error fetching pembelian:", error);
  }
};
export const fetchPembelianAdd = async (data_pembelian) => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post(
      "/pembelian/addpembelian",
      data_pembelian,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // const data = response.data;
    return response;
  } catch (error) {
    console.error("Error fetching pembelian:", error);
  }
};
