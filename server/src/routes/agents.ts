import { Hono } from "hono";
import { getPocketBase } from "../lib/pocketbase.js";

const agentsRoutes = new Hono();

// ============================================
// TYPES
// ============================================

interface AgentRecord {
  id: string;
  wallet_id: string;
  name: string;
  role: string;
  created: string;
  updated: string;
}

// ============================================
// GET /api/agents - List agents
// Query params: wallet_id, page, perPage
// ============================================

agentsRoutes.get("/api/agents", async (c) => {
  try {
    const walletId = c.req.query("wallet_id");
    const page = parseInt(c.req.query("page") || "1");
    const perPage = parseInt(c.req.query("perPage") || "50");

    if (!walletId) {
      return c.json(
        {
          success: false,
          error: "wallet_id is required",
        },
        400,
      );
    }

    const pb = await getPocketBase();

    const resultList = await pb.collection("agent").getList(page, perPage, {
      filter: `wallet_id="${walletId}"`,
      sort: "-created",
    });

    // Remove PocketBase internal fields
    const items = (resultList.items as unknown as AgentRecord[]).map((item) => ({
      id: item.id,
      wallet_id: item.wallet_id,
      name: item.name,
      role: item.role,
      created: item.created,
      updated: item.updated,
    }));

    return c.json({
      success: true,
      data: {
        items,
        page: resultList.page,
        perPage: resultList.perPage,
        totalItems: resultList.totalItems,
        totalPages: resultList.totalPages,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to list agents:", error);
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
// POST /api/agents - Create new agent
// Body: { wallet_id, name, role }
// ============================================

agentsRoutes.post("/api/agents", async (c) => {
  try {
    const body = await c.req.json();
    const { wallet_id, name, role } = body;

    if (!wallet_id) {
      return c.json(
        {
          success: false,
          error: "wallet_id is required",
        },
        400,
      );
    }

    if (!name) {
      return c.json(
        {
          success: false,
          error: "name is required",
        },
        400,
      );
    }

    if (!role) {
      return c.json(
        {
          success: false,
          error: "role is required",
        },
        400,
      );
    }

    const pb = await getPocketBase();

    const record = await pb.collection("agent").create({
      wallet_id,
      name,
      role,
    });

    console.log(`✅ Agent created: ${record.id} for wallet: ${wallet_id}`);

    return c.json({
      success: true,
      data: {
        id: record.id,
        wallet_id: record.wallet_id,
        name: record.name,
        role: record.role,
        created: record.created,
        updated: record.updated,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to create agent:", error);
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
// DELETE /api/agents/:id - Delete agent
// ============================================

agentsRoutes.delete("/api/agents/:id", async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          error: "Agent ID is required",
        },
        400,
      );
    }

    const pb = await getPocketBase();

    await pb.collection("agent").delete(id);

    console.log(`🗑️ Agent deleted: ${id}`);

    return c.json({
      success: true,
      message: `Agent ${id} deleted successfully`,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to delete agent:", error);
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

export default agentsRoutes;
