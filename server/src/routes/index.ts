import { Hono } from "hono";
import { config } from "../config/index.js";
import { pricing } from "../config/index.js";
import pkg from "../../package.json" with { type: "json" };

const VERSION = pkg.version;

const publicRoutes = new Hono();

// ============================================
// HOME - API INFO
// ============================================

publicRoutes.get("/", (c) => {
  return c.json({
    message: "Welcome to Kotak Pos API! 🚀",
    version: VERSION,
    features: {
      x402Payments: true,
      clientWallets: true,
      secretKeyAuth: true,
      network: config.x402.network,
    },
    flow: {
      step1: "POST /api/wallet - Create wallet, get secret_key & recovery_code",
      step2: "GET /api/wallet?walletId=xxx - Check balance & funding info",
      step3: "Fund wallet with USDC",
      step4: 'POST /api/pay with { "walletId": "xxx", "secretKey": "sk_xxx", "url": "..." }',
    },
    endpoints: {
      public: ["GET /health - Health check", "GET /api/status - API status"],
      wallet: [
        "POST /api/wallet - Create new wallet (returns secret_key & recovery_code)",
        "GET /api/wallet?walletId=xxx - Get balance & funding info",
        "POST /api/wallet/reset - Reset secret key with recovery code",
      ],
      agents: [
        "GET /api/agents - List agents ($0.01)",
        "POST /api/agents - Create agent {name, role} ($0.01)",
        "DELETE /api/agents/:id - Delete agent ($0.01)",
      ],
      mail: [
        "GET /api/mail?from_id=xxx|to_id=xxx - List mails ($0.0001)",
        "POST /api/mail - Send mail {from_id, to_id, subject, body} ($0.0001)",
        "GET /api/mail/:id - Get mail, marks as read ($0.0001)",
        "DELETE /api/mail/:id - Delete mail ($0.0001)",
      ],
      payment: [
        'POST /api/pay - Pay for any URL (body: {walletId, secretKey, url})',
      ],
    },
    security: {
      secretKey: "Required for all payment operations. Store it securely!",
      recoveryCode: "Use to reset secret key if lost via /api/wallet/reset",
    },
  });
});

// ============================================
// HEALTH CHECK
// ============================================

publicRoutes.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// API STATUS
// ============================================

publicRoutes.get("/api/status", (c) => {
  return c.json({
    status: "ok",
    version: VERSION,
    businessModel: "client-pays",
    features: {
      x402Payments: true,
      clientWallets: true,
      secretKeyAuth: true,
      network: config.x402.network,
    },
    pricing: Object.entries(pricing).reduce((acc, [path, p]) => {
      acc[path] = { price: p.price, description: p.description };
      return acc;
    }, {} as Record<string, { price: string; description: string }>),
    privy: {
      configured: !!(config.privy.appId && config.privy.appSecret),
      appId: config.privy.appId
        ? `${config.privy.appId.substring(0, 8)}...`
        : "not set",
    },
    pocketbase: {
      url: process.env.POCKETBASE_URL || "http://127.0.0.1:5001",
    },
  });
});

export default publicRoutes;
