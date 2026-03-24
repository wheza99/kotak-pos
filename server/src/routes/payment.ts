import { Hono } from "hono";
import { config } from "../config/index.js";
import { getWalletById, paidFetch } from "../lib/agent-payment.js";
import { verifySecretKey } from "../lib/secret-key.js";

const paymentRoutes = new Hono();

// ============================================
// PAY FOR ANY URL
// POST /api/pay
// Body: { walletId, secretKey, url }
// ============================================

paymentRoutes.post("/api/pay", async (c) => {
  try {
    const body = await c.req.json();
    const { walletId, secretKey, url } = body;

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "walletId is required",
        },
        400,
      );
    }

    if (!secretKey) {
      return c.json(
        {
          success: false,
          error: "secretKey is required",
          hint: "Use the secret key you received when creating your wallet",
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
            secretKey: "sk_your-secret-key",
            url: `${config.apiBaseUrl}/api/premium/insights`,
          },
        },
        400,
      );
    }

    // Verify wallet exists
    const wallet = await getWalletById(walletId);

    // Verify secret key
    const keyVerification = await verifySecretKey(walletId, secretKey);
    if (!keyVerification.valid) {
      return c.json(
        {
          success: false,
          error: keyVerification.error || "Invalid secret key",
          hint: "If you lost your secret key, use /api/wallet/reset with your recovery code",
        },
        401,
      );
    }

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
