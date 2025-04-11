import { fileMetadataModels } from "@models/fileMetadata-models";

export async function resolveImage(imagePathOrShortKey) {
  // If it's already a full URL, return it directly
  if (imagePathOrShortKey?.startsWith("https")) {
    return imagePathOrShortKey;
  }

  // Fallback: try resolving it as a shortKey
  try {
    const fileMetadata = await fileMetadataModels.findOne({
      shortkey: imagePathOrShortKey,
    });
    return fileMetadata?.fileUrl || "https://placehold.co/500x500";
  } catch (err) {
    console.error("Error resolving image:", err);
    return "https://placehold.co/500x500";
  }
}
