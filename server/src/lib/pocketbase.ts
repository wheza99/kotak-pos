import PocketBase from "pocketbase";

// ============================================
// POCKETBASE CLIENT
// ============================================

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:5001";
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || "";
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || "";

let pbClient: PocketBase | null = null;
let isAdminAuth = false;

/**
 * Get or create PocketBase client with admin authentication
 */
export async function getPocketBase(): Promise<PocketBase> {
  if (!pbClient) {
    pbClient = new PocketBase(POCKETBASE_URL);
    console.log(`📦 PocketBase connected to: ${POCKETBASE_URL}`);
  }

  // Authenticate as admin if credentials are provided and not already authenticated
  if (POCKETBASE_ADMIN_EMAIL && POCKETBASE_ADMIN_PASSWORD && !isAdminAuth) {
    try {
      await pbClient.admins.authWithPassword(
        POCKETBASE_ADMIN_EMAIL,
        POCKETBASE_ADMIN_PASSWORD,
      );
      isAdminAuth = true;
      console.log("🔐 PocketBase authenticated as admin");
    } catch (error) {
      console.warn("⚠️ Failed to authenticate as PocketBase admin:", error);
    }
  }

  return pbClient;
}

// ============================================
// TYPES
// ============================================

export interface SecretKeyRecord {
  id: string;
  wallet_id: string;
  secret_key: string;
  is_deprecated: boolean;
  created: string;
  updated: string;
}

export interface RecoveryCodeRecord {
  id: string;
  wallet_id: string;
  recovery_code: string;
  is_used: boolean;
  created: string;
  updated: string;
}
