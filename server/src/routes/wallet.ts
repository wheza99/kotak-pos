import { Hono } from "hono";
import {
  createClientWallet,
  getWalletById,
  getWalletFundingInfo,
  getWalletBalance,
} from "../lib/agent-payment.js";

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

export default walletRoutes;
