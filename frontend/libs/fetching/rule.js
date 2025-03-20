import client from "@/libs/axios";

export const fetchRuleList = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/rule/listrule",
      {}, // Pass id_rule in the request body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching rule:", error);
  }
};

export const fetchRuleListLogo = async () => {
  try {
    const response = await client.post("/rule/listrulelogo", {});

    return response;
  } catch (error) {
    console.error("Error fetching rule:", error);
  }
};

export const getRuleData = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/rule/getrule",
      { id }, // Pass id_rule in the request body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status == 200) {
      const data = response.data;
      return data;
    } else {
      Swal.fire("Gagal", response.error, "error");
    }
  } catch (error) {
    console.error("Error fetching rule:", error);
  }
};

export const updateRule = async (ruleId, requestBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.put(
      `/api/rule/${ruleId}`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error fetching rule:", error);
  }
};

export const deleteRule = async (id_rule) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.delete(`/api/rule/${id_rule}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error update rule:", error);
  }
};

export const addRule = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/rule/addrule", reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response;
  } catch (error) {
    console.error("Error add rule:", error);
  }
};
