import client from "@/libs/axios";
import useUserStore from "@/stores/user-store";
import { toast } from "react-toastify";

export const fetchUserList = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/user/listuser",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error fetching store:", error);
  }
};

export const addUserData = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/user/adduser", reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching store:", error);
  }
};

export const updateUserData = async (reqBody, id) => {
  try {
    const token = localStorage.getItem("token");
    console.log("BOD BOD", reqBody);
    console.log("IDI", id);
    const response = await client.put(`/api/user/${id}`, reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("RESEP", response);
    return response;
  } catch (error) {
    console.error("Error fetching store:", error);
  }
};

export const updateProfile = async (reqBody, id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.put(`/api/profile/${id}`, reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    useUserStore.getState().updateUserProfile(response.data);
    return response;
  } catch (error) {
    console.error("Error fetching store:", error);
  }
};

export const checkPass = async (reqBody, id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/login/checkpass", reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      toast.error("Wrong password!");
      return null;
    }
    return response;
  } catch (error) {
    console.error("Error fetching store:", error);
  }
};

export const fetchUserGet = async (id_user) => {
  if (!id_user) {
    console.warn("fetchUserGet called with undefined ID");
    throw new Error("User ID is required");
  }

  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/user/getuser",
      { id: id_user },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = {
      username: response.data.username,
      avatar: response.data.avatar,
      id: response.data._id,
      rule: response.data.rule,
      status: response.data.status,
      id_company: response.data.id_company,
      id_store: response.data.id_store,
    };
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getAvatar = async (id_user) => {
  try {
    const token = localStorage.getItem("token");

    const response = await client.post(
      "/user/getavatar",
      { id: id_user },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const deleteUser = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.delete(`/api/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};
