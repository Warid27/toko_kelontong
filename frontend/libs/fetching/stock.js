import client from "@/libs/axios";
import { toast } from "react-toastify";

export const fetchStockList = async () => {
  try {
    const token = localStorage.getItem("token");
    const id_store =
      localStorage.getItem("id_store") == "undefined"
        ? null
        : localStorage.getItem("id_store");
    const response = await client.post(
      "/stock/liststock",
      {
        id_store,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching stocks:", error);
  }
};

export const updateStock = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.put("/api/stock", reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      toast.success("Stock updated!");
    }
    return response;
  } catch (error) {
    console.error("Error fetching pembelian:", error);
  }
};
