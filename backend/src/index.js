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

Bun.serve({
  port: PORT,
  fetch(req) {
    return app.fetch(req);
  },
});

console.log(`🚀 Server running on PORT ${PORT}`);
console.log(`🌐 http://localhost:${PORT}`);
