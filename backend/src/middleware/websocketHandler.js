import { TypeModels } from "@models/type-models";

export const handleWebSocketMessage = async (ws, message, broadcast) => {
  try {
    const parsedMessage = JSON.parse(message);
    console.log("📩 Received:", parsedMessage);

    if (!parsedMessage.action) {
      ws.send(
        JSON.stringify({ action: "error", message: "Missing action type" })
      );
      return;
    }

    switch (parsedMessage.action) {
      case "listtype":
        try {
          const types = await TypeModels.find();
          const response = { action: "listtype", data: types || [] };
          console.log("📤 Sending response:", response);
          ws.send(JSON.stringify(response)); // ✅ Send to the requester
        } catch (error) {
          console.error("❌ Error fetching types:", error);
          ws.send(
            JSON.stringify({
              action: "error",
              message: "Failed to fetch types",
            })
          );
        }
        break;

      case "addtype":
        try {
          const newType = new TypeModels({ type: parsedMessage.type });
          await newType.save();
          console.log("✅ New type added:", newType);

          // 🔥 Fetch updated list & broadcast to all clients
          const types = await TypeModels.find();
          broadcast({ action: "listtype", data: types });
        } catch (error) {
          console.error("❌ Error adding type:", error);
          ws.send(
            JSON.stringify({ action: "error", message: "Failed to add type" })
          );
        }
        break;

      case "ping":
        ws.send(JSON.stringify({ action: "pong" }));
        break;

      default:
        console.warn("⚠️ Unknown WebSocket action:", parsedMessage.action);
        ws.send(JSON.stringify({ action: "error", message: "Unknown action" }));
        break;
    }
  } catch (error) {
    console.error("❌ Error parsing WebSocket message:", error);
    ws.send(
      JSON.stringify({ action: "error", message: "Invalid JSON format" })
    );
  }
};
