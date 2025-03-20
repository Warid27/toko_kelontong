import { useState } from "react";
import imageCompression from "browser-image-compression";

// Custom hook for image compression
export const useImageCompression = (options = {}) => {
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [compressedImages, setCompressedImages] = useState(0);

  // Default compression options
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: "image/webp",
    ...options,
  };

  // Compress multiple files with progress tracking
  const compressFiles = async (files) => {
    if (!files || files.length === 0) return [];

    try {
      setCompressing(true);
      setProgress(0);
      setTotalImages(files.length);
      setCompressedImages(0);

      const compressedFiles = [];

      for (let i = 0; i < files.length; i++) {
        // Skip non-image files
        if (!files[i].type.startsWith("image/")) {
          compressedFiles.push(files[i]);
          continue;
        }

        // Compress image file
        const compressedFile = await imageCompression(files[i], defaultOptions);

        // Create new file with webp extension
        const originalName = files[i].name.replace(/\.[^.]+$/, "");
        const newFileName = `${originalName}.webp`;

        const result = new File([compressedFile], newFileName, {
          type: "image/webp",
        });
        compressedFiles.push(result);

        // Update progress
        setCompressedImages(i + 1);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setCompressing(false);
      return compressedFiles;
    } catch (error) {
      console.error("Error compressing images:", error);
      setCompressing(false);
      return Array.from(files); // Return original files if compression fails
    }
  };

  return {
    compressFiles,
    compressing,
    progress,
    totalImages,
    compressedImages,
  };
};
