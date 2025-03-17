// tokenUtils.js
import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  return localStorage.getItem("token") || null;
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Math.floor(Date.now() / 1000);
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

export const decodeToken = (token) => {
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
