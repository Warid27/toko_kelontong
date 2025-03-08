import client from "@/libs/axios";

export const fetchCompanyList = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/company/listcompany",
      {}, // Pass id_store in the request body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching companies:", error);
  }
};

export const fetchCompanyListLogo = async () => {
  try {
    const response = await client.post("/company/listcompanylogo", {});

    return response;
  } catch (error) {
    console.error("Error fetching companies:", error);
  }
};

export const getCompanyData = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      "/company/getcompany",
      { id }, // Pass id_store in the request body
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
    console.error("Error fetching companies:", error);
  }
};

export const updateCompany = async (companyId, requestBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.put(
      `/api/company/${companyId}`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error fetching companies:", error);
  }
};

export const deleteCompany = async (id_company) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.delete(`/api/company/${id_company}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error update store:", error);
  }
};

export const addCompany = async (reqBody) => {
  try {
    const token = localStorage.getItem("token");
    const response = await client.post("/company/addcompany", reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response;
  } catch (error) {
    console.error("Error add store:", error);
  }
};
