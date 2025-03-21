import client from "@/libs/axios";
import Swal from "sweetalert2";
import { clearUserCache } from "@/utils/tokenDecoded";

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
      Swal.fire("Gagal", response.data.message || "Login gagal", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Rethrow the error for further handling
  }
};

export const registerService = async (reqBody) => {
  try {
    localStorage.clear();
    const response = await client.post("/register", reqBody);

    if (response.status === 200) {
      return response;
    } else {
      Swal.fire("Gagal", response.data.message || "Register gagal", "error");
    }
  } catch (error) {
    console.error("Register error:", error);
    throw error; // Rethrow the error for further handling
  }
};
