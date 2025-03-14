import client from "@/libs/axios"

export const fetchPaymentList = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await client.post("/payment/listpayment",{}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data
      return data
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  export const updatePayment = async (paymentId, requestBody) => {
    try {
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/payment/${paymentId}`,
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
  
  export const deletePayment = async (id_payment) => {
    try {
      const token = localStorage.getItem("token");
      const response = await client.delete(`/api/payment/${id_payment}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response;
    } catch (error) {
      console.error("Error update store:", error);
    }
  };
  

  export const fetchPaymentAdd = async (payment_method, keterangan) => {
    try {
        const token = localStorage.getItem("token");
        const response = await client.post(
            "/payment/addpayment",
            {
              payment_method: payment_method,
              keterangan: keterangan,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
      const data = response;

      return data
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };