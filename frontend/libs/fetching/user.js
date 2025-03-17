import client from "@/libs/axios";

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
    const response = await client.put(`/api/user/${id}`, reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching store:", error);
  }
};

export const fetchUserGet = async () => {
  try {
    const token = localStorage.getItem("token");
    const id_user = localStorage.getItem("id");
    if (!id_user) {
      console.error("user_id is missing in localStorage");
      return;
    }
    const response = await client.post(
      "/user/getuser",
      { id: id_user },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const getAvatar = async () => {
  try {
    const token = localStorage.getItem("token");
    const id_user = localStorage.getItem("id");
    if (!id_user) {
      console.error("user_id is missing in localStorage");
      return;
    }
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
