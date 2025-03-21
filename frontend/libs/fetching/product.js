import client from "@/libs/axios";
import { compressImages } from "@/utils/ImageCompressor";

export const fetchProductsList = async (
  id_store = null,
  id_company = null,
  status = null,
  params = null,
  id_category_product = null
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
      ...(id_category_product && { id_category_product }),
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
    const token = localStorage.getItem("token");

    const response = await client.post("/product/getproduct", requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error.message);
    throw error; // Supaya error bisa ditangani di pemanggil fungsi
  }
};

export const fetchProductsAdd = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post(
      "/product/addproduct",
      reqBody, // Pass id_store in the request body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const AddProductByExcel = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");

    // Extract image from FormData
    const imageFiles = reqBody.getAll("images");
    if (imageFiles.length > 0) {
      const compressedImages = await compressImages(imageFiles);
      // Remove old images and append compressed ones
      reqBody.delete("images");
      compressedImages.forEach((image) => reqBody.append("images", image));
    }

    const response = await client.post(
      "/product/file",
      reqBody, // Pass id_store in the request body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const AddBatchProducts = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post(
      "/product/addbatch",
      reqBody, // Pass id_store in the request body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const listProductStatus = async () => {
  try {
    const response = await client.post("/product/liststatus", {});

    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const updateProduct = async (productId, requestBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.put(
      `/api/product/${productId}`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error fetching product:", error);
  }
};

export const deleteProduct = async (id_product) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.delete(`/api/product/${id_product}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error update product:", error);
  }
};
