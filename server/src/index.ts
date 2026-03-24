import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config, corsConfig, x402Middleware } from "./config/index.js";
import pkg from "../package.json" with { type: "json" };

// Import routes
import publicRoutes from "./routes/index.js";
import walletRoutes from "./routes/wallet.js";
import premiumRoutes from "./routes/premium.js";
import paymentRoutes from "./routes/payment.js";
import agentsRoutes from "./routes/agents.js";

const VERSION = pkg.version;

// ============================================
// CREATE APP
// ============================================

const app = new Hono();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

app.use("*", logger());
app.use("*", cors(corsConfig));

// ============================================
// X402 PAYMENT MIDDLEWARE (Premium Routes)
// ============================================

app.use("/api/premium/*", x402Middleware);
app.use("/api/agents", x402Middleware);

// ============================================
// REGISTER ROUTES
// ============================================

app.route("/", publicRoutes);
app.route("/", walletRoutes);
app.route("/", premiumRoutes);
app.route("/", paymentRoutes);
app.route("/", agentsRoutes);

// ============================================
// START SERVER
// ============================================

console.log("");
console.log(`🚀 Kotak Pos API Server v${VERSION}`);
console.log("=".repeat(40));
console.log(`📡 Server: ${config.apiBaseUrl}`);
console.log(`🌐 Network: ${config.x402.network}`);
console.log(`💰 Business Model: Client pays from their wallet!`);
console.log("");
console.log("📝 Quick Start:");
console.log("   1. POST /api/wallet");
console.log("   2. GET /api/wallet?walletId=xxx");
console.log('   3. POST /api/pay {"url":"...","walletId":"xxx"}');
console.log("");

serve({
  fetch: app.fetch,
  port: config.port,
});
