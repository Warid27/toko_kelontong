import client from "@/libs/axios";

export const fetchCategoryList = async (id_store) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/category/listcategories",
      {
        id_store,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error fetching category:", error);
  }
};
export const fetchCategoryAdd = async (name_category) => {
  try {
    const token = localStorage.getItem("token");
    const id_store =
      localStorage.getItem("id_store") == "undefined"
        ? null
        : localStorage.getItem("id_store");
    const response = await client.post(
      "/category/addcategory",
      {
        name_category: name_category,
        id_store: id_store,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error fetching category:", error);
  }
};
