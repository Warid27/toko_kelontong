// checkAuth.js
import { getToken, isTokenExpired } from "@/utils/tokenUtils";

export const checkAuth = (setIsAuthenticated, handleLogout) => {
  if (typeof window === "undefined") return;

  const token = getToken();

  if (
    !token ||
    token === "undefined" ||
    token === "null" ||
    isTokenExpired(token)
  ) {
    setIsAuthenticated(false);
    handleLogout();
  } else {
    setIsAuthenticated(true);
  }
};
