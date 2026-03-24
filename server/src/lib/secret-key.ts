import { getPocketBase } from "./pocketbase.js";
import type { SecretKeyRecord, RecoveryCodeRecord } from "./pocketbase.js";

// ============================================
// GENERATE RANDOM STRINGS
// ============================================

/**
 * Generate a cryptographically secure random string
 */
function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

/**
 * Generate secret key (32 characters)
 */
export function generateSecretKey(): string {
  return `sk_${generateRandomString(29)}`; // sk_ + 29 chars = 32 total
}

/**
 * Generate recovery code (format: XXXX-XXXX-XXXX-XXXX)
 */
export function generateRecoveryCode(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(generateRandomString(4).toUpperCase());
  }
  return `rc_${segments.join("-")}`;
}

// ============================================
// SECRET KEY OPERATIONS
// ============================================

/**
 * Create a new secret key for a wallet
 */
export async function createSecretKey(walletId: string): Promise<string> {
  const pb = await getPocketBase();
  const secretKey = generateSecretKey();

  await pb.collection("secret_key").create({
    wallet_id: walletId,
    secret_key: secretKey,
    is_deprecated: false,
  });

  console.log(`🔐 Created secret key for wallet: ${walletId}`);
  return secretKey;
}

/**
 * Verify secret key for a wallet
 */
export async function verifySecretKey(
  walletId: string,
  secretKey: string,
): Promise<{ valid: boolean; error?: string }> {
  const pb = await getPocketBase();

  try {
    const records = await pb.collection("secret_key").getFullList({
      filter: `wallet_id = "${walletId}" && secret_key = "${secretKey}" && is_deprecated = false`,
    });

    if (records.length === 0) {
      return { valid: false, error: "Invalid or deprecated secret key" };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error verifying secret key:", error);
    return { valid: false, error: "Failed to verify secret key" };
  }
}

/**
 * Deprecate all secret keys for a wallet
 */
export async function deprecateSecretKeys(walletId: string): Promise<void> {
  const pb = await getPocketBase();

  try {
    const records = await pb.collection("secret_key").getFullList({
      filter: `wallet_id = "${walletId}" && is_deprecated = false`,
    });

    for (const record of records) {
      await pb.collection("secret_key").update(record.id, {
        is_deprecated: true,
      });
    }

    console.log(`🔓 Deprecated ${records.length} secret keys for wallet: ${walletId}`);
  } catch (error) {
    console.error("Error deprecating secret keys:", error);
    throw error;
  }
}

/**
 * Get active secret key for a wallet (for internal use only)
 */
export async function getActiveSecretKey(
  walletId: string,
): Promise<string | null> {
  const pb = await getPocketBase();

  try {
    const records = await pb.collection("secret_key").getFullList({
      filter: `wallet_id = "${walletId}" && is_deprecated = false`,
      sort: "-created",
    });

    if (records.length === 0) {
      return null;
    }

    return (records[0] as unknown as SecretKeyRecord).secret_key;
  } catch (error) {
    console.error("Error getting active secret key:", error);
    return null;
  }
}

// ============================================
// RECOVERY CODE OPERATIONS
// ============================================

/**
 * Create a new recovery code for a wallet
 */
export async function createRecoveryCode(walletId: string): Promise<string> {
  const pb = await getPocketBase();
  const recoveryCode = generateRecoveryCode();

  await pb.collection("recovery_code").create({
    wallet_id: walletId,
    recovery_code: recoveryCode,
    is_used: false,
  });

  console.log(`🔑 Created recovery code for wallet: ${walletId}`);
  return recoveryCode;
}

/**
 * Reset secret key using recovery code
 * Also generates a new recovery code
 */
export async function resetSecretKeyWithRecoveryCode(
  walletId: string,
  recoveryCode: string,
): Promise<{ success: boolean; newSecretKey?: string; newRecoveryCode?: string; error?: string }> {
  const pb = await getPocketBase();

  try {
    // Find the recovery code
    const records = await pb.collection("recovery_code").getFullList({
      filter: `wallet_id = "${walletId}" && recovery_code = "${recoveryCode}" && is_used = false`,
    });

    if (records.length === 0) {
      return { success: false, error: "Invalid or already used recovery code" };
    }

    const recoveryRecord = records[0];

    // Mark recovery code as used
    await pb.collection("recovery_code").update(recoveryRecord.id, {
      is_used: true,
    });

    // Deprecate all existing secret keys
    await deprecateSecretKeys(walletId);

    // Create new secret key
    const newSecretKey = await createSecretKey(walletId);

    // Create new recovery code
    const newRecoveryCode = await createRecoveryCode(walletId);

    console.log(`🔄 Reset secret key for wallet: ${walletId}`);

    return { success: true, newSecretKey, newRecoveryCode };
  } catch (error) {
    console.error("Error resetting secret key:", error);
    return { success: false, error: "Failed to reset secret key" };
  }
}

/**
 * Check if wallet has unused recovery codes
 */
export async function hasUnusedRecoveryCode(walletId: string): Promise<boolean> {
  const pb = await getPocketBase();

  try {
    const records = await pb.collection("recovery_code").getFullList({
      filter: `wallet_id = "${walletId}" && is_used = false`,
    });

    return records.length > 0;
  } catch (error) {
    console.error("Error checking recovery codes:", error);
    return false;
  }
}
