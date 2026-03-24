import { Hono } from "hono";
import { config } from "../config/index.js";
import { getWalletById, paidFetch } from "../lib/agent-payment.js";

const paymentRoutes = new Hono();

// ============================================
// PAY FOR ANY URL
// POST /api/pay
// Body: { walletId, url }
// ============================================

paymentRoutes.post("/api/pay", async (c) => {
  try {
    const body = await c.req.json();
    const { walletId, url } = body;

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "walletId is required",
        },
        400,
      );
    }

    if (!url) {
      return c.json(
        {
          success: false,
          error: "url is required",
          example: {
            walletId: "your-wallet-id",
            url: `${config.apiBaseUrl}/api/premium/insights`,
          },
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

export default paymentRoutes;
