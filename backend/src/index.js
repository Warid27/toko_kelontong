import { Hono } from "hono";
import { PORT, HOST_NAME } from "@config/config";
import { cors } from "hono/cors"; // Import middleware CORS

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
import emailRoutes from "@routes/email-routes";
import ruleRoutes from "@routes/rule_access-routes";

const app = new Hono();

// Middleware CORS
app.use(
  cors({
    origin: `http://${HOST_NAME}:${PORT}`,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware for JSON responses
app.use("*", async (c, next) => {
  c.header("Content-Type", "application/json");
  await next();
});

// Routes (Alphabetically Sorted)
const routes = {
  "/rule": ruleRoutes,
  "/email": emailRoutes,
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

Bun.serve({
  port: PORT,
  hostname: HOST_NAME,
  fetch(req) {
    return app.fetch(req);
  },
});

console.log(`🚀 Server running on PORT ${PORT}`);
console.log(`🌐 http://${HOST_NAME}:${PORT}`);
