import client from "@/libs/axios";
import { toast } from "react-toastify";
import { clearUserCache } from "@/utils/tokenDecoded";

// Make sure to include this CSS in your main app file or component
// import "react-toastify/dist/ReactToastify.css";

export const loginServices = async (reqBody) => {
  try {
    localStorage.clear();
    clearUserCache();

    const response = await client.post("/login", reqBody);

    if (response.status === 200) {
      const { token } = response.data;

      localStorage.setItem("token", token);
      return token;
    } else {
      toast.error(response.data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Rethrow the error for further handling
  }
};

export const registerService = async (reqBody) => {
  try {
    localStorage.clear();
    clearUserCache();

    const response = await client.post("/register", reqBody);

    if (response.status === 200) {
      return response;
    } else {
      toast.error(response.data.message || "Registration failed");
    }
  } catch (error) {
    console.error("Register error:", error);
    throw error; // Rethrow the error for further handling
  }
};
