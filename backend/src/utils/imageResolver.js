import { fileMetadataModels } from "@models/fileMetadata-models"; // Import file metadata model

/**
 * Resolves an image URL from its short key.
 * @param {string} shortKey - The short key of the image.
 * @returns {Promise<string>} - The resolved image URL or a fallback image.
 */
export async function resolveImage(shortKey) {
  if (!shortKey) {
    return "https://placehold.co/500x500"; // Default placeholder image
  }
  try {
    const fileMetadata = await fileMetadataModels.findOne({
      shortkey: shortKey,
    });
    return fileMetadata ? fileMetadata.fileUrl : "https://placehold.co/500x500";
  } catch (error) {
    console.error("Error resolving image:", error);
    return "https://placehold.co/500x500"; // Fallback image
  }
}
