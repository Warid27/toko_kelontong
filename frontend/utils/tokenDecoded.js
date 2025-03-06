import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  const token = localStorage.getItem("token") || null;
  return token;
};

export const tokenDecoded = () => {
  try {
    const token = getToken();
    if (!token) return null;

    const decoded = jwtDecode(token);

    // Check if the token is expired
    const currentTime = Date.now() / 1000; // Convert to seconds
    if (decoded.exp && decoded.exp < currentTime) {
      console.error("Token expired");
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
