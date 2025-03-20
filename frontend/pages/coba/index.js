import { useState, useEffect } from "react";
import { IoIosCloudDone } from "react-icons/io";
import { FaFileUpload, FaFolder } from "react-icons/fa";
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

// Main component
const ProductUploader = () => {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Use the compression hook
  const {
    compressFiles,
    compressing,
    progress,
    totalImages,
    compressedImages,
  } = useImageCompression({
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
  });

  // Handle Excel file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle folder selection with compression
  const handleFolderChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // Start compression process
      const compressedFiles = await compressFiles(files);
      setFolder(compressedFiles);
    }
  };

  // Handle upload
  const handleProductBatch = async () => {
    if (!file || !folder || folder.length === 0) {
      alert("Please select both an Excel file and image folder");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      // Add compressed images to formData
      folder.forEach((image) => {
        formData.append("images", image);
      });

      formData.append("id_store", "your-store-id");
      formData.append("id_company", "your-company-id");

      // Send to backend
      const response = await fetch("/api/file", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert(`Upload successful! Processed ${result.count} items.`);
      } else {
        alert(`Upload failed: ${result.message}`);
      }

      setIsUploading(false);
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  // Function to open modal
  const modalOpen = (modalType, isOpen) => {
    // Your existing modal logic here
  };

  return (
    <div>
      <button
        onClick={() => {
          modalOpen("add", false);
          modalOpen("example", true);
        }}
      >
        example
      </button>
      <h1 className="text-lg font-semibold text-gray-800 text-center mb-2">
        Upload Excel & Folder Gambar
      </h1>

      {/* Excel file upload */}
      <div className="upload-container">
        <label className="upload-label">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {file && <p>File dipilih: {file.name}</p>}
          <div className="upload-content">
            {file ? (
              <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                <IoIosCloudDone className="text-5xl text-[#FDDC05]" />
                <p className="text-sm text-[#FDDC05]">File Uploaded</p>
              </div>
            ) : (
              <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                <FaFileUpload className="text-5xl text-[#FDDC05]" />
                <p className="text-sm text-[#FDDC05]">New File</p>
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Image folder upload with compression */}
      <div className="upload-container mt-4">
        <label className="upload-label">
          <input
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderChange}
            style={{ display: "none" }}
            disabled={compressing}
          />

          {compressing ? (
            <div className="compression-status">
              <div className="progress-bar w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-[#FDDC05] h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p>
                Compressing images: {compressedImages} of {totalImages} (
                {progress}%)
              </p>
            </div>
          ) : folder ? (
            <p>{folder.length} file gambar dipilih (optimized to WebP)</p>
          ) : (
            <div className="flex items-center justify-center flex-col">
              <FaFileUpload className="text-4xl text-[#FDDC05] mb-2" />
              <p>Pilih folder gambar</p>
            </div>
          )}
        </label>
      </div>

      {/* Upload button */}
      <button
        onClick={handleProductBatch}
        className={`addBtn mt-4 ${
          isUploading || compressing ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isUploading || compressing || !file || !folder}
      >
        {isUploading
          ? "Uploading..."
          : compressing
          ? "Compressing..."
          : "Upload"}
      </button>
    </div>
  );
};

export default ProductUploader;
