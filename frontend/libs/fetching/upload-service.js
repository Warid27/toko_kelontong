import client from "@/libs/axios";

export const uploadImage = async (formData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post("/api/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching companies:", error);
  }
};
