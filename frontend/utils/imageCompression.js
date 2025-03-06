export const compressionSettings = {
  add_product: { maxSizeMB: 1, maxWidthOrHeight: 720 }, // Product
  update_product: { maxSizeMB: 1, maxWidthOrHeight: 720 }, // Product
  add: { maxSizeMB: 0.5, maxWidthOrHeight: 512 }, // Logo | Icon
  update: { maxSizeMB: 0.5, maxWidthOrHeight: 512 }, // Logo | Icon
  header: { maxSizeMB: 1, maxWidthOrHeight: 1280 }, // Headers
  banner: { maxSizeMB: 1, maxWidthOrHeight: 1920 }, // Banners (larger)
  motive: { maxSizeMB: 0.8, maxWidthOrHeight: 1080 }, // Decorative motives
  footer_motive: { maxSizeMB: 0.8, maxWidthOrHeight: 1080 }, // Footer motives
};
