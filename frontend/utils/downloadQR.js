import { toJpeg } from "html-to-image";
import { toast } from "react-toastify";

/**
 * Downloads a QR code as a JPEG image.
 * @param {HTMLElement} element - The reference to the QR code container.
 * @param {string} name - The filename suffix.
 */
export const downloadQR = async (element, name) => {
  if (!element) return;

  try {
    const dataUrl = await toJpeg(element, {
      quality: 1, // Ensures high-quality JPG
      backgroundColor: "#ffffff", // Ensures white background
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qr-code-${name}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success toast
    toast.success("QR Code berhasil diunduh!", { position: "top-right" });
  } catch (error) {
    toast.error("Gagal mengunduh QR Code!", { position: "top-right" });
    console.error("Failed to download QR Code:", error);
  }
};
