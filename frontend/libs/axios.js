import axios from "axios";
import Cookies from "js-cookie";

const client = axios.create({
  baseURL: "/api/v1",
});

client.interceptors.request.use(function (config) {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
