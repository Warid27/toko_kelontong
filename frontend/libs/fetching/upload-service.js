import client from "@/libs/axios";
import imageCompression from "browser-image-compression";
import { compressionSettings } from "@/utils/imageCompression";
import { tokenDecoded } from "@/utils/tokenDecoded";

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
    console.error("Error uploading image:", error);
  }
};

export const uploadImageCompress = async (file, params, pathPrefix) => {
  try {
    const options = {
      ...compressionSettings[params], // Pick settings based on `params`
      useWebWorker: true, // Improve performance
      fileType: "image/webp", // Convert to WebP for best quality
    };

    // 🔹 Compress the file
    const compressedFile = await imageCompression(file, options);

    const token = localStorage.getItem("token");

    const userData = tokenDecoded();
    const id_user = userData.id;

    // 🔹 Preserve the original file name while changing extension to .webp
    const originalName = file.name.replace(/\.[^.]+$/, ""); // Remove original extension
    const newFileName = `${originalName}.webp`;

    // 🔹 Prepare FormData for upload
    const formData = new FormData();
    formData.append("file", compressedFile, newFileName); // Use WebP with original name
    formData.append("id_user", id_user);
    formData.append("pathPrefix", pathPrefix);

    const response = await client.post("/api/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    console.error("Error uploading compressed image:", error);
  }
};

export const CompressImage = async (file) => {
  try {
    const options = {
      maxSizeMB: 1, // Example compression setting
      maxWidthOrHeight: 1024, // Example max dimensions
      useWebWorker: true, // Improve performance
      fileType: "image/webp", // Convert to WebP for best quality
    };

    // 🔹 Compress the file
    const compressedFile = await imageCompression(file, options);

    // 🔹 Preserve the original file name while changing extension to .webp
    const originalName = file.name.replace(/\.[^.]+$/, ""); // Remove original extension
    const newFileName = `${originalName}.webp`;

    return new File([compressedFile], newFileName, { type: "image/webp" });
  } catch (error) {
    console.error("Error compressing image:", error);
  }
};

