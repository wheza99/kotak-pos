import { Hono } from "hono";
import {
  createClientWallet,
  getWalletById,
  getWalletFundingInfo,
  getWalletBalance,
} from "../lib/agent-payment.js";
import {
  createSecretKey,
  createRecoveryCode,
  resetSecretKeyWithRecoveryCode,
} from "../lib/secret-key.js";

const walletRoutes = new Hono();

// ============================================
// WALLET ENDPOINT
// POST   /api/wallet      → Create new wallet
// GET    /api/wallet      → Get balance & info
// ============================================

// POST /api/wallet - Create new wallet
walletRoutes.post("/api/wallet", async (c) => {
  try {
    const wallet = await createClientWallet();
    const fundingInfo = await getWalletFundingInfo(wallet.address, wallet.id);

    // Generate secret key and recovery code
    const secretKey = await createSecretKey(wallet.id);
    const recoveryCode = await createRecoveryCode(wallet.id);

    console.log(`✅ Wallet created with secret key and recovery code: ${wallet.id}`);

    return c.json({
      success: true,
      warning: "⚠️ IMPORTANT: Store your secret_key and recovery_code securely. They will NEVER be shown again!",
      data: {
        walletId: wallet.id,
        address: wallet.address,
        secretKey: secretKey,
        recoveryCode: recoveryCode,
        network: fundingInfo.network,
        asset: fundingInfo.asset,
        fundingInstructions: fundingInfo.instructions,
        faucetUrl: fundingInfo.faucetUrl,
      },
      usage: {
        secretKey: "Use this key to authenticate payment requests via /api/pay",
        recoveryCode: "Use this code to reset your secret key if lost via /api/wallet/reset",
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

// GET /api/wallet - Get balance & info
walletRoutes.get("/api/wallet", async (c) => {
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
    const fundingInfo = await getWalletFundingInfo(wallet.address, wallet.id);

    return c.json({
      success: true,
      data: {
        walletId: wallet.id,
        address: wallet.address,
        network: fundingInfo.network,
        asset: fundingInfo.asset,
        balance: {
          usdc: balance.usdc,
          eth: balance.eth,
        },
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

// ============================================
// RESET SECRET KEY
// POST /api/wallet/reset
// Body: { walletId, recoveryCode }
// ============================================

walletRoutes.post("/api/wallet/reset", async (c) => {
  try {
    const body = await c.req.json();
    const { walletId, recoveryCode } = body;

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "walletId is required",
        },
        400,
      );
    }

    if (!recoveryCode) {
      return c.json(
        {
          success: false,
          error: "recoveryCode is required",
        },
        400,
      );
    }

    // Verify wallet exists
    await getWalletById(walletId);

    // Reset secret key with recovery code
    const result = await resetSecretKeyWithRecoveryCode(walletId, recoveryCode);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: result.error,
        },
        400,
      );
    }

    console.log(`🔄 Secret key reset for wallet: ${walletId}`);

    return c.json({
      success: true,
      warning: "⚠️ IMPORTANT: Store your new secret_key and recovery_code securely. They will NEVER be shown again!",
      data: {
        walletId: walletId,
        newSecretKey: result.newSecretKey,
        newRecoveryCode: result.newRecoveryCode,
      },
      message: "Your old secret key and recovery code have been invalidated. Use the new credentials for future operations.",
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

export default walletRoutes;
