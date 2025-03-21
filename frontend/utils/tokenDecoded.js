import { getToken, decodeToken, isTokenExpired } from "@/utils/tokenUtils";
import { fetchUserGet } from "@/libs/fetching/user";

// Create a cache to prevent duplicate requests
let userDataCache = null;
let userDataPromise = null;

export const tokenDecoded = async () => {
  // Return cached data if available
  if (userDataCache) {
    return userDataCache;
  }

  // If a request is already in progress, wait for it
  if (userDataPromise) {
    return userDataPromise;
  }

  // Create a new promise for this request
  userDataPromise = (async () => {
    try {
      // Get token and validate it exists
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Check token expiration
      if (isTokenExpired(token)) {
        throw new Error("Authentication token has expired");
      }

      // Decode the token
      const dataToken = decodeToken(token);
      if (!dataToken || !dataToken.id) {
        throw new Error("Failed to decode authentication token or missing ID");
      }

      // Add a small delay to help with race conditions
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Fetch user data
      const response = await fetchUserGet(dataToken.id);
      if (!response) {
        throw new Error("User data not found");
      }

      // Cache the successful response
      userDataCache = response;
      return response;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw new Error(`Failed to retrieve user data: ${error.message}`);
    } finally {
      // Clear the promise reference when done
      userDataPromise = null;
    }
  })();

  return userDataPromise;
};

export const clearUserCache = () => {
  userDataCache = null; // Clear cached user data
  userDataPromise = null; // Reset ongoing request
};
