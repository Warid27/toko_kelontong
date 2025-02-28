import { Hono } from "hono";
import { PORT } from "@config/config";
import loginRoutes from "@routes/login-routes";
import registerRoutes from "@routes/register-routes";
import productRoutes from "@routes/product-routes";
import companyRoutes from "@routes/company-routes";
import storeRoutes from "@routes/store-routes";
import apiRoutes from "@routes/api-routes";
import typeRoutes from "@routes/type-routes";
import extrasRoutes from "@routes/extras-routes";
import sizeRoutes from "@routes/size-routes";
import userRoutes from "@routes/user-routes";
import orderRoutes from "@routes/order-routes";
import tableRoutes from "@routes/table-routes";
import paymentRoutes from "@routes/payment-routes";
import stockRoutes from "@routes/stock-routes";
import pembelianRoutes from "@routes/pembelian-routes";
import salesRoutes from "@routes/sales-routes";
import salesCampaignRoutes from "@routes/salesCampaign-routes";
import itemCampaignRoutes from "@routes/itemCampaign-routes";
import categoryRoutes from "@routes/category-routes";
import { ServerWebSocket } from "bun";
import { handleWebSocketMessage } from "@middleware/websocketHandler";

const app = new Hono();

// Middleware for JSON responses
app.use("*", async (c, next) => {
  c.header("Content-Type", "application/json");
  await next();
});

// Routes (Alphabetically Sorted)
const routes = {
  "/api": apiRoutes,
  "/category": categoryRoutes,
  "/company": companyRoutes,
  "/extras": extrasRoutes,
  "/itemcampaign": itemCampaignRoutes,
  "/login": loginRoutes,
  "/order": orderRoutes,
  "/payment": paymentRoutes,
  "/pembelian": pembelianRoutes,
  "/product": productRoutes,
  "/register": registerRoutes,
  "/sales": salesRoutes,
  "/salescampaign": salesCampaignRoutes,
  "/size": sizeRoutes,
  "/stock": stockRoutes,
  "/store": storeRoutes,
  "/table": tableRoutes,
  "/type": typeRoutes,
  "/user": userRoutes,
};

for (const [path, handler] of Object.entries(routes)) {
  app.route(path, handler);
}

// Static File Serving
const serveStaticFile = async (c, folder) => {
  try {
    const filePath = `.${folder}${c.req.path.replace(folder, "")}`;
    return new Response(Bun.file(filePath));
  } catch (error) {
    return c.text("File not found", 404);
  }
};

app.use("/public/*", (c) => serveStaticFile(c, "/public"));
app.use("/uploads/*", (c) => serveStaticFile(c, "/uploads"));
app.use("/swal/*", (c) => serveStaticFile(c, "/node_modules/sweetalert2/dist"));

// WebSocket Clients Management
globalThis.webSocketClients ??= new Set();

globalThis.broadcast = (data) => {
  console.log(`📢 Broadcasting:`, data);
  console.log(`👥 Connected Clients:`, globalThis.webSocketClients.size); // Debugging

  for (const client of globalThis.webSocketClients) {
    try {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      } else {
        console.log("❌ Removing closed client");
        globalThis.webSocketClients.delete(client);
      }
    } catch (error) {
      console.error("❌ Error broadcasting:", error);
      globalThis.webSocketClients.delete(client);
    }
  }
};

Bun.serve({
  port: PORT,
  websocket: {
    open(ws) {
      if (globalThis.webSocketClients.has(ws)) {
        console.log("⚠️ Client already connected");
        return;
      }
      globalThis.webSocketClients.add(ws);
      console.log(
        "✅ WebSocket connection established. Total clients:",
        globalThis.webSocketClients.size
      );
    },
    close(ws) {
      globalThis.webSocketClients.delete(ws);
      console.log(
        "❌ Client disconnected. Remaining:",
        globalThis.webSocketClients.size
      );
    },
  },
});

console.log(`🚀 Server running on PORT ${PORT}`);
console.log(`🌐 http://localhost:${PORT}`);
