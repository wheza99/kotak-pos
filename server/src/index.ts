import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { paymentMiddleware } from "x402-hono";
import {
  createClientWallet,
  getWalletById,
  getWalletFundingInfo,
  getWalletBalance,
  paidFetch,
} from "./lib/agent-payment.js";

const app = new Hono();

// ============================================
// CONFIGURATION
// ============================================

// Payment recipient address - where USDC payments will be sent
// TODO: Replace with your actual wallet address or use env variable
const PAY_TO_ADDRESS =
  process.env.X402_PAY_TO_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

// Network configuration - use environment variable to switch between testnet/mainnet
// Options: 'base' (mainnet) or 'base-sepolia' (testnet)
const X402_NETWORK = (process.env.X402_NETWORK || "base-sepolia") as
  | "base"
  | "base-sepolia";

// API base URL for agent calls
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// ============================================
// X402 PAYMENT MIDDLEWARE
// ============================================

// Configure x402 payment middleware with PayAI facilitator
const x402Middleware = paymentMiddleware(
  PAY_TO_ADDRESS as `0x${string}`,
  {
    // Premium API routes that require payment
    "/api/premium/insights": {
      price: "$0.001", // $0.01 USD in USDC
      network: X402_NETWORK,
      config: {
        description: "Access premium AI insights",
        mimeType: "application/json",
        maxTimeoutSeconds: 60,
      },
    },
    "/api/premium/report": {
      price: "$0.002", // $0.05 USD in USDC
      network: X402_NETWORK,
      config: {
        description: "Generate detailed report",
        mimeType: "application/json",
        maxTimeoutSeconds: 120,
      },
    },
    "/api/premium/analysis": {
      price: "$0.003", // $0.10 USD in USDC
      network: X402_NETWORK,
      config: {
        description: "Deep market analysis",
        mimeType: "application/json",
        maxTimeoutSeconds: 180,
      },
    },
  },
  // Use PayAI facilitator
  {
    url: "https://facilitator.payai.network",
  },
);

// ============================================
// MIDDLEWARE
// ============================================

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:5173",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-PAYMENT"],
    exposeHeaders: ["X-PAYMENT-RESPONSE"],
  }),
);

// Apply x402 payment middleware to premium routes
app.use("/api/premium/*", x402Middleware);

// ============================================
// PUBLIC ROUTES
// ============================================

app.get("/", (c) => {
  return c.json({
    message: "Welcome to Privy-Hono Payment API! 🚀",
    version: "2.0.0",
    features: {
      x402Payments: true,
      clientWallets: true,
      network: X402_NETWORK,
    },
    flow: {
      step1: "POST /api/wallet/create - Create a wallet",
      step2: "GET /api/wallet/fund?walletId=xxx - Get funding instructions",
      step3: "Fund wallet with USDC",
      step4:
        'POST /api/pay/insights with { "walletId": "xxx" } - Pay & get content',
    },
    endpoints: {
      public: ["GET /health - Health check", "GET /api/status - API status"],
      wallet: [
        "POST /api/wallet/create - Create new wallet",
        "GET /api/wallet/info?walletId=xxx - Get wallet info",
        "GET /api/wallet/balance?walletId=xxx - Get balance",
        "GET /api/wallet/fund?walletId=xxx - Get funding instructions",
      ],
      premium: [
        "GET /api/premium/insights - Premium AI insights ($0.01)",
        "GET /api/premium/report - Detailed report ($0.05)",
        "GET /api/premium/analysis - Deep analysis ($0.10)",
      ],
      payment: [
        "POST /api/pay/insights - Pay for insights (body: {walletId})",
        "POST /api/pay/report - Pay for report (body: {walletId})",
        "POST /api/pay/analysis - Pay for analysis (body: {walletId})",
        "POST /api/pay - Pay any x402 API (body: {url, walletId})",
      ],
    },
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Free API routes
app.get("/api/status", (c) => {
  return c.json({
    status: "ok",
    version: "2.0.0",
    businessModel: "client-pays",
    features: {
      x402Payments: true,
      clientWallets: true,
      network: X402_NETWORK,
    },
    privy: {
      configured: !!(process.env.PRIVY_APP_ID && process.env.PRIVY_APP_SECRET),
      appId: process.env.PRIVY_APP_ID
        ? `${process.env.PRIVY_APP_ID.substring(0, 8)}...`
        : "not set",
    },
  });
});

// ============================================
// PREMIUM ROUTES (require x402 payment)
// ============================================

app.get("/api/premium/insights", (c) => {
  // This route is protected by x402 middleware
  // If payment is valid, this handler will be reached
  return c.json({
    success: true,
    data: {
      insights: [
        "🤖 AI-powered market analysis shows 23% growth potential",
        "📈 Recommended tech stack: HonoJS + Privy + x402",
        "🎯 Target audience: Web3 developers and AI agents",
        "💡 Key insight: Payment-enabled APIs are the future",
      ],
      generatedAt: new Date().toISOString(),
      paid: true,
    },
  });
});

app.get("/api/premium/report", (c) => {
  return c.json({
    success: true,
    data: {
      report: {
        title: "Comprehensive Analysis Report",
        summary: "Deep dive into your data with AI-powered insights",
        sections: [
          {
            name: "Market Analysis",
            content:
              "Growing market with 15% YoY growth. Key drivers include Web3 adoption and AI integration.",
          },
          {
            name: "Competition",
            content:
              "Moderate competition. Opportunity for differentiation through seamless payment integration.",
          },
          {
            name: "Technical Recommendations",
            content:
              "Use HonoJS for performance, Privy for auth, x402 for payments. Deploy on edge infrastructure.",
          },
          {
            name: "Financial Projections",
            content:
              "Revenue potential of $50K-$200K MRR with proper monetization strategy.",
          },
        ],
        generatedAt: new Date().toISOString(),
      },
      paid: true,
    },
  });
});

app.get("/api/premium/analysis", (c) => {
  return c.json({
    success: true,
    data: {
      analysis: {
        title: "Deep Market Analysis",
        type: "premium",
        metrics: {
          marketCap: "$2.5B",
          growthRate: "23%",
          riskLevel: "Medium",
          recommendation: "Buy",
        },
        trends: [
          { period: "Q1 2024", trend: "Bullish", confidence: 85 },
          { period: "Q2 2024", trend: "Stable", confidence: 72 },
          { period: "Q3 2024", trend: "Bullish", confidence: 91 },
        ],
        generatedAt: new Date().toISOString(),
      },
      paid: true,
    },
  });
});

// ============================================
// WALLET & PAYMENT ROUTES (Client-provided wallet)
// ============================================

/**
 * Create a new wallet for client/agent
 * Client should use this wallet to pay for API calls
 */
app.post("/api/wallet/create", async (c) => {
  try {
    const wallet = await createClientWallet();
    const fundingInfo = await getWalletFundingInfo(wallet.address, wallet.id);

    return c.json({
      success: true,
      data: {
        walletId: wallet.id,
        address: wallet.address,
        network: fundingInfo.network,
        asset: fundingInfo.asset,
        fundingInstructions: fundingInfo.instructions,
        faucetUrl: fundingInfo.faucetUrl,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

/**
 * Get wallet info by ID
 * Query param: walletId
 */
app.get("/api/wallet/info", async (c) => {
  try {
    const walletId = c.req.query("walletId");

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "walletId query parameter is required",
        },
        400,
      );
    }

    const wallet = await getWalletById(walletId);
    const fundingInfo = await getWalletFundingInfo(wallet.address, wallet.id);

    return c.json({
      success: true,
      data: {
        walletId: wallet.id,
        address: wallet.address,
        network: fundingInfo.network,
        asset: fundingInfo.asset,
        fundingInstructions: fundingInfo.instructions,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

/**
 * Get wallet balance
 * Query param: walletId (required)
 */
app.get("/api/wallet/balance", async (c) => {
  try {
    const walletId = c.req.query("walletId");

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "walletId query parameter is required",
        },
        400,
      );
    }

    const wallet = await getWalletById(walletId);
    const balance = await getWalletBalance(wallet.address);

    return c.json({
      success: true,
      data: {
        walletId: wallet.id,
        address: wallet.address,
        ...balance,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

/**
 * Get funding instructions for a wallet
 * Query param: walletId (required)
 */
app.get("/api/wallet/fund", async (c) => {
  try {
    const walletId = c.req.query("walletId");

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "walletId query parameter is required",
        },
        400,
      );
    }

    const wallet = await getWalletById(walletId);
    const fundingInfo = await getWalletFundingInfo(wallet.address, wallet.id);

    return c.json({
      success: true,
      data: fundingInfo,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

// ============================================
// PAYMENT ENDPOINTS (Client wallet pays!)
// ============================================

/**
 * Pay for premium insights
 * POST body: { "walletId": "your_wallet_id" }
 * The client's wallet will be charged, NOT the server wallet!
 */
app.post("/api/pay/insights", async (c) => {
  try {
    const body = await c.req.json();
    const { walletId } = body;

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "walletId is required in request body",
        },
        400,
      );
    }

    const wallet = await getWalletById(walletId);
    const targetUrl = `${API_BASE_URL}/api/premium/insights`;

    console.log(`💰 Client ${wallet.address} paying for insights...`);

    const result = await paidFetch<{
      success: boolean;
      data: { insights: string[] };
    }>(targetUrl, wallet.id, wallet.address);

    if (result.error) {
      return c.json(
        {
          success: false,
          error: result.error,
          paid: result.paid,
        },
        400,
      );
    }

    return c.json({
      success: true,
      paid: result.paid,
      data: result.data,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

/**
 * Pay for premium report
 * POST body: { "walletId": "your_wallet_id" }
 */
app.post("/api/pay/report", async (c) => {
  try {
    const body = await c.req.json();
    const { walletId } = body;

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "walletId is required in request body",
        },
        400,
      );
    }

    const wallet = await getWalletById(walletId);
    const targetUrl = `${API_BASE_URL}/api/premium/report`;

    console.log(`💰 Client ${wallet.address} paying for report...`);

    const result = await paidFetch<{
      success: boolean;
      data: { report: Record<string, unknown> };
    }>(targetUrl, wallet.id, wallet.address);

    if (result.error) {
      return c.json(
        {
          success: false,
          error: result.error,
          paid: result.paid,
        },
        400,
      );
    }

    return c.json({
      success: true,
      paid: result.paid,
      data: result.data,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

/**
 * Pay for premium analysis
 * POST body: { "walletId": "your_wallet_id" }
 */
app.post("/api/pay/analysis", async (c) => {
  try {
    const body = await c.req.json();
    const { walletId } = body;

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "walletId is required in request body",
        },
        400,
      );
    }

    const wallet = await getWalletById(walletId);
    const targetUrl = `${API_BASE_URL}/api/premium/analysis`;

    console.log(`💰 Client ${wallet.address} paying for analysis...`);

    const result = await paidFetch<{
      success: boolean;
      data: { analysis: Record<string, unknown> };
    }>(targetUrl, wallet.id, wallet.address);

    if (result.error) {
      return c.json(
        {
          success: false,
          error: result.error,
          paid: result.paid,
        },
        400,
      );
    }

    return c.json({
      success: true,
      paid: result.paid,
      data: result.data,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

/**
 * Pay for ANY x402-enabled API
 * POST body: { "url": "https://api.example.com/premium", "walletId": "your_wallet_id" }
 */
app.post("/api/pay", async (c) => {
  try {
    const body = await c.req.json();
    const { url, walletId } = body;

    if (!url) {
      return c.json(
        {
          success: false,
          error: "url is required in request body",
        },
        400,
      );
    }

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "walletId is required in request body",
        },
        400,
      );
    }

    const wallet = await getWalletById(walletId);

    console.log(`💰 Client ${wallet.address} paying for: ${url}`);

    const result = await paidFetch(url, wallet.id, wallet.address);

    return c.json({
      success: !result.error,
      paid: result.paid,
      data: result.data,
      error: result.error,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

/**
 * DEPRECATED: Use /api/pay instead
 * Kept for backward compatibility
 * POST body: { "url": "...", "walletId": "xxx" }
 */
app.post("/api/agent/pay", async (c) => {
  try {
    const body = await c.req.json();
    const { url, walletId } = body;

    if (!url) {
      return c.json(
        {
          success: false,
          error: "url is required in request body",
        },
        400,
      );
    }

    if (!walletId) {
      return c.json(
        {
          success: false,
          error:
            "walletId is required in request body. Create wallet first: POST /api/wallet/create",
        },
        400,
      );
    }

    const wallet = await getWalletById(walletId);

    console.log(`💰 Client ${wallet.address} paying for: ${url}`);

    const result = await paidFetch(url, wallet.id, wallet.address);

    return c.json({
      success: !result.error,
      paid: result.paid,
      data: result.data,
      error: result.error,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

// ============================================
// START SERVER
// ============================================

const port = Number(process.env.PORT) || 3000;

console.log("");
console.log("🚀 Privy-Hono Payment Server v2.0");
console.log("=".repeat(40));
console.log(`📡 Server: http://localhost:${port}`);
console.log(`🌐 Network: ${X402_NETWORK}`);
console.log(`💰 Business Model: Client pays from their wallet!`);
console.log("");
console.log("📝 Quick Start:");
console.log("   1. POST /api/wallet/create");
console.log("   2. GET /api/wallet/fund?walletId=xxx");
console.log('   3. POST /api/pay/insights {"walletId":"xxx"}');
console.log("");

serve({
  fetch: app.fetch,
  port,
});
