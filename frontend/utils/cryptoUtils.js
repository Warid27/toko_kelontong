import CryptoJS from "crypto-js";

const SECRET_KEY = "ADMIN123"; // Keep this secret and secure

/**
 * Encrypts an object into a URL-safe string
 * @param {Object} data - The object to encrypt (e.g., { id_store, id_company })
 * @returns {string} - Encrypted and URL-encoded string
 */
export const encryptData = (data) => {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  return encodeURIComponent(encrypted); // Encode for URL safety
};

/**
 * Decrypts an encrypted string back into an object
 * @param {string} encryptedString - The encrypted and URL-encoded string
 * @returns {Object|null} - Decrypted object or null if decryption fails
 */
export const decryptData = (encryptedString) => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      decodeURIComponent(encryptedString),
      SECRET_KEY
    );
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
