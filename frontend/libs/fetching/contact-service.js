import client from "@/libs/axios";

export const sendMessage = async (reqBody) => {
  try {
    const response = await client.post("/email/send", reqBody, {});

    return response;
  } catch (error) {
    console.error("Error send message:", error);
  }
};

export const authMessage = async (reqBody) => {
  try {
    const response = await client.post("/email/get-oauth", reqBody, {});

    return response;
  } catch (error) {
    console.error("Error send message:", error);
  }
};
