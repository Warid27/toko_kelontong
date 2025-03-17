import { getToken, decodeToken, isTokenExpired } from "@/utils/tokenUtils";

export const tokenDecoded = () => {
  const token = getToken();
  if (!token) return null;

  if (isTokenExpired(token)) {
    console.error("Token expired");
    return null;
  }

  return decodeToken(token);
};
