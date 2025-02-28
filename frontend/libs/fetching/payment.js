import client from "@/libs/axios"

export const fetchPaymentList = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await client.post("/payment/listpayment", {
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
      const data = response.data;

      return data
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };