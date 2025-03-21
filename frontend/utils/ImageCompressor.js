import imageCompression from "browser-image-compression";

// Utility function for image compression
export const compressImages = async (files, options = {}) => {
  if (!files || files.length === 0) return [];

  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: "image/webp",
    ...options,
  };

  try {
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        if (!file.type.startsWith("image/")) return file;

        const compressedFile = await imageCompression(file, defaultOptions);
        const originalName = file.name.replace(/\.[^.]+$/, "");
        const newFileName = `${originalName}.webp`;

        return new File([compressedFile], newFileName, { type: "image/webp" });
      })
    );

    return compressedFiles;
  } catch (error) {
    console.error("Error compressing images:", error);
    return Array.from(files); // Return original files if compression fails
  }
};
