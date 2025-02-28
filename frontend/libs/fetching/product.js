import client from "@/libs/axios";
export const fetchProductsList = async (
  id_store = null,
  id_company = null,
  status = null,
  params = null
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token not found");

    if (!id_company && !id_store && params) {
      return [];
    }

    const requestBody = {
      ...(id_store && { id_store }),
      ...(id_company && { id_company }),
      ...(status && { status }),
      ...(id_store && params && { params }),
    };

    const response = await client.post("/product/listproduct", requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error; // Agar bisa ditangani oleh pemanggil fungsi
  }
};

export const fetchProductsAdd = async (data) => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post(
      "/product/addproduct",
      { data }, // Pass id_store in the request body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = renponse.data;
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};
