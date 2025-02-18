import { Hono } from "hono";
import { PORT } from "@config/config";
// import { cors } from "hono/cors";
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

// Routes
app.route("/payment", paymentRoutes);
app.route("/table", tableRoutes);
app.route("/order", orderRoutes);
app.route("/user", userRoutes);
app.route("/extras", extrasRoutes);
app.route("/size", sizeRoutes);
app.route("/store", storeRoutes);
app.route("/company", companyRoutes);
app.route("/product", productRoutes);
app.route("/login", loginRoutes);
app.route("/register", registerRoutes);
app.route("/type", typeRoutes);
app.route("/sales", salesRoutes);
app.route("/salescampaign", salesCampaignRoutes);
app.route("/itemcampaign", itemCampaignRoutes);
app.route("/category", categoryRoutes);
app.route("/api", apiRoutes);

// Static File Serving
app.use("/public/*", async (c) => {
  const filePath = `./public${c.req.path.replace("/public", "")}`;
  return new Response(Bun.file(filePath));
});
app.use("/uploads/*", async (c) => {
  const filePath = `./uploads${c.req.path.replace("/uploads", "")}`;
  return new Response(Bun.file(filePath));
});
app.use("/swal/*", async (c) => {
  const filePath = `./node_modules/sweetalert2/dist${c.req.path.replace(
    "/swal",
    ""
  )}`;
  return new Response(Bun.file(filePath));
});

// CORS
// app.use(
//   cors({
//     origin: "http://localhost:8000", // Allow requests from the frontend
//     credentials: true, // Allow cookies and authorization headers
//   })
// );
// Start the server
Bun.serve({
  port: PORT,
  fetch: app.fetch,
});
console.log(`Server listening on PORT ${PORT}`);
console.log(`http://localhost:${PORT}`);
