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

export const fetchGetProducts = async (id_product, params = undefined) => {
  try {
    if (!id_product) {
      throw new Error("id_product is required");
    }

    const requestBody = { id: id_product };
    if (params) {
      requestBody.params = params;
    }
    const token = localStorage.getItem('token')

    const response = await client.post("/product/getproduct", requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error.message);
    throw error; // Supaya error bisa ditangani di pemanggil fungsi
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
