import imageCompression from "browser-image-compression";

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const options = {
    maxSizeMB: 1, // Max file size: 1MB
    maxWidthOrHeight: 1024, // Resize: max 1024px width/height
    useWebWorker: true,
    fileType: "image/webp", // Convert to WebP for better compression
  };

  try {
    const compressedFile = await imageCompression(file, options);

    // Automatically download the compressed image
    const compressedBlob = new Blob([compressedFile], {
      type: compressedFile.type,
    });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(compressedBlob);
    downloadLink.download = "compressed-image.webp";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    console.log("Compression successful!");
  } catch (error) {
    console.error("Compression failed:", error);
  }
};
