// const socketInstance = (() => {
//   let socket = null;
//   let listeners = [];

//   const connect = () => {
//     if (socket?.readyState === WebSocket.OPEN) {
//       console.log("🔒 WebSocket already open");
//       return socket;
//     }
//     socket = new WebSocket("ws://localhost:8080/ws");
//     socket.onopen = () => {
//       console.log("✅ WebSocket connected");
//       socket.send(JSON.stringify({ action: "listtype" }));
//     };
//     socket.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       console.log("📩 Message from server:", message);
//       listeners.forEach((listener) => listener(message));
//     };
//     socket.onerror = (error) => console.error("❌ WebSocket error:", error);
//     socket.onclose = (event) => {
//       console.warn(
//         `⚠️ WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`
//       );
//       socket = null;
//       if (event.code !== 1000) setTimeout(connect, 2000);
//     };
//     return socket;
//   };

//   return {
//     connect: (onMessage) => {
//       const socket = connect();
//       listeners.push(onMessage);
//       return {
//         disconnect: () => {
//           listeners = listeners.filter((l) => l !== onMessage);
//           if (listeners.length === 0 && socket.readyState === WebSocket.OPEN) {
//             socket.close(1000, "No listeners remaining");
//           }
//         },
//       };
//     },
//   };
// })();

// export default socketInstance;
