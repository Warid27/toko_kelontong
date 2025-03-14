import client from "@/libs/axios";
import Swal from "sweetalert2";

export const loginServices = async (reqBody) => {
  try {
    localStorage.clear();
    const response = await client.post("/login", reqBody);

    if (response.status === 200) {
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("id", user.id);
      localStorage.setItem("username", user.username);
      localStorage.setItem("id_store", user.id_store);
      localStorage.setItem("id_company", user.id_company);
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
