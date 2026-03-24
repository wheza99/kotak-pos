import { Hono } from "hono";
import { getPocketBase } from "../lib/pocketbase.js";

const mailRoutes = new Hono();

// ============================================
// TYPES
// ============================================

interface MailRecord {
  id: string;
  from_id: string;
  to_id: string;
  subject: string;
  body: string;
  created: string;
  updated: string;
}

interface CreateMailBody {
  from_id: string;
  to_id: string;
  subject: string;
  body: string;
}

// ============================================
// HELPER: Verify agent belongs to wallet
// ============================================

async function verifyAgentOwnership(
  pb: Awaited<ReturnType<typeof getPocketBase>>,
  agentId: string,
  walletId: string,
): Promise<boolean> {
  try {
    const agent = await pb.collection("agent").getOne(agentId);
    return agent.wallet_id === walletId;
  } catch {
    return false;
  }
}

// ============================================
// HELPER: Get all agent IDs for a wallet
// ============================================

async function getWalletAgentIds(
  pb: Awaited<ReturnType<typeof getPocketBase>>,
  walletId: string,
): Promise<string[]> {
  const agents = await pb.collection("agent").getFullList({
    filter: `wallet_id="${walletId}"`,
    fields: "id",
  });
  return agents.map((a) => a.id);
}

// ============================================
// GET /api/mail - List mails
// Query params: wallet_id, type (inbox|sent), page, perPage
// ============================================

mailRoutes.get("/api/mail", async (c) => {
  try {
    const walletId = c.req.query("wallet_id");
    const type = c.req.query("type") || "inbox"; // inbox | sent | all
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

    // Get all agent IDs for this wallet
    const agentIds = await getWalletAgentIds(pb, walletId);

    if (agentIds.length === 0) {
      return c.json({
        success: true,
        data: {
          items: [],
          page,
          perPage,
          totalItems: 0,
          totalPages: 0,
        },
      });
    }

    // Build filter based on type
    let filter = "";
    const agentFilter = agentIds.map((id) => `to_id="${id}"`).join(" || ");
    const fromFilter = agentIds.map((id) => `from_id="${id}"`).join(" || ");

    if (type === "inbox") {
      filter = `(${agentFilter})`;
    } else if (type === "sent") {
      filter = `(${fromFilter})`;
    } else {
      filter = `(${agentFilter}) || (${fromFilter})`;
    }

    const resultList = await pb.collection("mail").getList(page, perPage, {
      filter,
      sort: "-created",
      expand: "from_id,to_id",
    });

    // Clean response
    const items = resultList.items.map((item: Record<string, unknown>) => ({
      id: item.id,
      from_id: item.from_id,
      to_id: item.to_id,
      subject: item.subject,
      body: item.body,
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
    console.error("Failed to list mails:", error);
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
// POST /api/mail - Create new mail
// Body: { from_id, to_id, subject, body }
// wallet_id auto-injected by /api/pay
// ============================================

mailRoutes.post("/api/mail", async (c) => {
  try {
    const body = await c.req.json<CreateMailBody & { wallet_id: string }>();
    const { wallet_id, from_id, to_id, subject, body: mailBody } = body;

    if (!wallet_id) {
      return c.json(
        {
          success: false,
          error: "wallet_id is required",
        },
        400,
      );
    }

    if (!from_id) {
      return c.json(
        {
          success: false,
          error: "from_id (sender agent) is required",
        },
        400,
      );
    }

    if (!to_id) {
      return c.json(
        {
          success: false,
          error: "to_id (recipient agent) is required",
        },
        400,
      );
    }

    if (!subject) {
      return c.json(
        {
          success: false,
          error: "subject is required",
        },
        400,
      );
    }

    if (!mailBody) {
      return c.json(
        {
          success: false,
          error: "body is required",
        },
        400,
      );
    }

    const pb = await getPocketBase();

    // Verify from_id belongs to the wallet (permission check)
    const isOwner = await verifyAgentOwnership(pb, from_id, wallet_id);
    if (!isOwner) {
      return c.json(
        {
          success: false,
          error: "Permission denied: from_id agent does not belong to your wallet",
        },
        403,
      );
    }

    // Verify to_id agent exists
    try {
      await pb.collection("agent").getOne(to_id);
    } catch {
      return c.json(
        {
          success: false,
          error: "Recipient agent (to_id) not found",
        },
        404,
      );
    }

    // Create mail
    const record = await pb.collection("mail").create({
      from_id,
      to_id,
      subject,
      body: mailBody,
    });

    console.log(`✅ Mail created: ${record.id} from ${from_id} to ${to_id}`);

    return c.json({
      success: true,
      data: {
        id: record.id,
        from_id: record.from_id,
        to_id: record.to_id,
        subject: record.subject,
        body: record.body,
        created: record.created,
        updated: record.updated,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to create mail:", error);
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
// GET /api/mail/:id - Get single mail
// ============================================

mailRoutes.get("/api/mail/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const walletId = c.req.query("wallet_id");

    if (!id) {
      return c.json(
        {
          success: false,
          error: "Mail ID is required",
        },
        400,
      );
    }

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

    const record = await pb.collection("mail").getOne(id, {
      expand: "from_id,to_id",
    });

    // Verify permission: wallet must own either from_id or to_id agent
    const agentIds = await getWalletAgentIds(pb, walletId);
    const hasPermission =
      agentIds.includes(record.from_id as string) ||
      agentIds.includes(record.to_id as string);

    if (!hasPermission) {
      return c.json(
        {
          success: false,
          error: "Permission denied: you don't have access to this mail",
        },
        403,
      );
    }

    return c.json({
      success: true,
      data: {
        id: record.id,
        from_id: record.from_id,
        to_id: record.to_id,
        subject: record.subject,
        body: record.body,
        created: record.created,
        updated: record.updated,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to get mail:", error);
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
// DELETE /api/mail/:id - Delete mail
// ============================================

mailRoutes.delete("/api/mail/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const walletId = c.req.query("wallet_id");

    if (!id) {
      return c.json(
        {
          success: false,
          error: "Mail ID is required",
        },
        400,
      );
    }

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

    const record = await pb.collection("mail").getOne(id);

    // Verify permission: wallet must own either from_id or to_id agent
    const agentIds = await getWalletAgentIds(pb, walletId);
    const hasPermission =
      agentIds.includes(record.from_id as string) ||
      agentIds.includes(record.to_id as string);

    if (!hasPermission) {
      return c.json(
        {
          success: false,
          error: "Permission denied: you don't have access to this mail",
        },
        403,
      );
    }

    await pb.collection("mail").delete(id);

    console.log(`🗑️ Mail deleted: ${id}`);

    return c.json({
      success: true,
      message: `Mail ${id} deleted successfully`,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to delete mail:", error);
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

export default mailRoutes;
