import client from "@/libs/axios";

// export const fetchTypeStream = (onData) => {
//   const eventSource = new EventSource(
//     "http://localhost:8080/type/listtype/stream"
//   );

//   eventSource.onmessage = (event) => {
//     try {
//       const data = JSON.parse(event.data);
//       console.log("DATA", data);
//       onData(data);
//     } catch (error) {
//       console.error("Error parsing SSE data:", error);
//     }
//   };
//   eventSource.onerror = (error) => {
//     console.error("SSE Error:", error);
//     eventSource.close(); // Close the old connection
//     setTimeout(() => {
//       fetchTypeStream(onData); // Reconnect after 3 seconds
//     }, 3000);
//   };

//   return () => {
//     console.log("Closing SSE connection");
//     eventSource.close();
//   };
// };

export const fetchTypeAdd = async (type) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token not found");

    const response = await client.post(
      "/type/addtype",
      { type },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding type:", error.message);
    throw error; // Lempar error agar bisa ditangkap di pemanggilnya
  }
};

export const fetchTypeList = async () => {
  try {
    const token = localStorage.getItem("token")
    const response = await client.post(
      "/type/listtype",
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
    console.error("Error fetching type:", error);
  }
};
