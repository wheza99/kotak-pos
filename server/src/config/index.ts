import { paymentMiddleware } from "x402-hono";
import { buildX402Routes } from "./pricing.js";

// ============================================
// TYPES
// ============================================

export type X402Network = "base" | "base-sepolia";

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

export const config = {
  // Server
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // API
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",

  // Privy
  privy: {
    appId: process.env.PRIVY_APP_ID || "",
    appSecret: process.env.PRIVY_APP_SECRET || "",
    authPrivateKey: process.env.PRIVY_AUTH_PRIVATE_KEY || "",
    authId: process.env.PRIVY_AUTH_ID || "",
  },

  // x402 Payment
  x402: {
    payToAddress:
      process.env.X402_PAY_TO_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    network: (process.env.X402_NETWORK || "base-sepolia") as X402Network,
  },
};

// ============================================
// NETWORK CONSTANTS
// ============================================

export const BASE_RPC_URLS: Record<X402Network, string> = {
  base: "https://mainnet.base.org",
  "base-sepolia": "https://sepolia.base.org",
};

export const USDC_CONTRACTS: Record<X402Network, string> = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

// ============================================
// X402 PAYMENT MIDDLEWARE
// ============================================

const x402Routes = buildX402Routes(config.x402.network);

export const x402Middleware = paymentMiddleware(
  config.x402.payToAddress as `0x${string}`,
  x402Routes,
  {
    url: "https://facilitator.payai.network",
  },
);

// ============================================
// CORS CONFIGURATION
// ============================================

export const corsConfig = {
  origin: [
    "http://localhost:3000",
    "http://localhost:4000",
    "http://localhost:5173",
  ],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-PAYMENT"],
  exposeHeaders: ["X-PAYMENT-RESPONSE"],
};

// Re-export pricing for convenience
export { pricing, getPricing, getAllPricing, getPricingRoutes } from "./pricing.js";
