import { PrivyClient } from "@privy-io/node";
import { createX402Client } from "@privy-io/node/x402";
import { wrapFetchWithPayment } from "@x402/fetch";
import { config, BASE_RPC_URLS, USDC_CONTRACTS } from "../config/index.js";

// ============================================
// TYPES
// ============================================

type WalletChainType =
  | "ethereum"
  | "solana"
  | "cosmos"
  | "stellar"
  | "sui"
  | "aptos"
  | "movement"
  | "tron"
  | "bitcoin-segwit"
  | "near"
  | "ton"
  | "starknet"
  | "spark";

// ============================================
// PRIVY CLIENT
// ============================================

let privyClient: PrivyClient | null = null;

/**
 * Get or create Privy client
 */
export function getPrivyClient(): PrivyClient {
  if (!privyClient) {
    if (!config.privy.appId || !config.privy.appSecret) {
      throw new Error(
        "PRIVY_APP_ID and PRIVY_APP_SECRET are required for agent payments",
      );
    }
    privyClient = new PrivyClient({
      appId: config.privy.appId,
      appSecret: config.privy.appSecret,
    });
  }
  return privyClient;
}

/**
 * Get authorization context for wallet operations
 */
function getAuthorizationContext() {
  if (!config.privy.authPrivateKey) {
    console.warn("⚠️ PRIVY_AUTH_PRIVATE_KEY not set, payment signing may fail");
    return undefined;
  }

  // Remove 'wallet-auth:' prefix if present
  const privateKey = config.privy.authPrivateKey.replace(/^wallet-auth:/, "");

  console.log(
    "🔑 Using authorization private key (length):",
    privateKey.length,
  );

  return {
    authorization_private_keys: [privateKey],
  };
}

// ============================================
// WALLET OPERATIONS
// ============================================

/**
 * Create a new wallet for a client/agent
 * This wallet will be used to PAY for API calls
 */
export async function createClientWallet(): Promise<{
  id: string;
  address: string;
}> {
  const client = getPrivyClient();

  console.log("🔧 Creating new client wallet...");

  const walletParams: { chain_type: WalletChainType; owner_id?: string } = {
    chain_type: "ethereum",
  };

  // Use server's key quorum as owner so we can sign on behalf of this wallet
  if (config.privy.authId) {
    walletParams.owner_id = config.privy.authId;
  }

  const wallet = await client.wallets().create(walletParams);

  console.log(`✅ Created client wallet: ${wallet.address}`);

  return { id: wallet.id, address: wallet.address };
}

/**
 * Get wallet by ID
 */
export async function getWalletById(
  walletId: string,
): Promise<{ id: string; address: string }> {
  const client = getPrivyClient();

  const wallet = await client.wallets().get(walletId);

  if (!wallet) {
    throw new Error(`Wallet not found: ${walletId}`);
  }

  return { id: wallet.id, address: wallet.address };
}

// ============================================
// X402 PAYMENT CLIENT
// ============================================

/**
 * Create x402 payment client for a specific wallet with authorization
 */
export async function getX402Client(walletId: string, walletAddress: string) {
  const client = getPrivyClient();
  const authContext = getAuthorizationContext();

  console.log("📦 Creating x402 client with:");
  console.log("   Wallet ID:", walletId);
  console.log("   Address:", walletAddress);
  console.log("   Auth Context:", authContext ? "provided" : "NOT provided");

  const x402Client = createX402Client(client, {
    walletId: walletId,
    address: walletAddress,
    authorizationContext: authContext,
  });

  return x402Client;
}

/**
 * Fetch wrapper that automatically handles x402 payments for a specific wallet
 */
export async function createPaidFetch(walletId: string, walletAddress: string) {
  const x402Client = await getX402Client(walletId, walletAddress);
  return wrapFetchWithPayment(fetch, x402Client);
}

/**
 * Payment service - fetch with automatic x402 payment handling
 */
export async function paidFetch<T = unknown>(
  url: string,
  walletId: string,
  walletAddress: string,
  options?: RequestInit,
): Promise<{ data: T | null; error: string | null; paid: boolean }> {
  try {
    const fetchWithPayment = await createPaidFetch(walletId, walletAddress);
    const response = await fetchWithPayment(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null,
        error: errorData.error || `HTTP ${response.status}`,
        paid: false,
      };
    }

    const data = await response.json();
    return { data, error: null, paid: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: errorMessage, paid: false };
  }
}

// ============================================
// BALANCE UTILITIES
// ============================================

// ERC20 balanceOf function selector
const BALANCE_OF_SELECTOR = "0x70a08231";

/**
 * Convert hex to decimal string
 */
function hexToDecimal(hex: string): string {
  if (!hex || hex === "0x") return "0";
  return BigInt(hex).toString();
}

/**
 * Format wei to ETH
 */
function weiToEth(wei: string): string {
  const weiBigInt = BigInt(wei);
  const ethBigInt = weiBigInt / BigInt(10 ** 12);
  const ethNumber = Number(ethBigInt) / 10 ** 6;
  return ethNumber.toFixed(6);
}

/**
 * Format USDC (6 decimals) to readable string
 */
function formatUSDC(raw: string): string {
  const rawBigInt = BigInt(raw);
  const usdcNumber = Number(rawBigInt) / 10 ** 6;
  return usdcNumber.toFixed(2);
}

/**
 * Make JSON-RPC call to Base RPC
 */
async function rpcCall(
  url: string,
  method: string,
  params: unknown[],
): Promise<unknown> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  const data = (await response.json()) as {
    result?: unknown;
    error?: { message: string };
  };

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.result;
}

/**
 * Get ETH balance from Base RPC
 */
async function getEthBalance(rpcUrl: string, address: string): Promise<string> {
  try {
    const result = (await rpcCall(rpcUrl, "eth_getBalance", [
      address,
      "latest",
    ])) as string;
    return hexToDecimal(result);
  } catch (error) {
    console.error("Failed to get ETH balance:", error);
    return "0";
  }
}

/**
 * Get USDC balance using ERC20 balanceOf
 */
async function getUsdcBalance(
  rpcUrl: string,
  walletAddress: string,
  usdcContract: string,
): Promise<string> {
  try {
    // Pad address to 32 bytes
    const paddedAddress = walletAddress
      .slice(2)
      .toLowerCase()
      .padStart(64, "0");
    const data = BALANCE_OF_SELECTOR + paddedAddress;

    const result = (await rpcCall(rpcUrl, "eth_call", [
      { to: usdcContract, data },
      "latest",
    ])) as string;

    return hexToDecimal(result);
  } catch (error) {
    console.error("Failed to get USDC balance:", error);
    return "0";
  }
}

/**
 * Get wallet balance from Base network by wallet address
 */
export async function getWalletBalance(walletAddress: string): Promise<{
  usdc: string;
  eth: string;
  rawUsdc: string;
  rawEth: string;
}> {
  const { network } = config.x402;
  const rpcUrl = BASE_RPC_URLS[network];
  const usdcContract = USDC_CONTRACTS[network];

  console.log(`💰 Checking balance for ${walletAddress} on ${network}...`);

  try {
    const [rawEth, rawUsdc] = await Promise.all([
      getEthBalance(rpcUrl, walletAddress),
      getUsdcBalance(rpcUrl, walletAddress, usdcContract),
    ]);

    const formattedEth = weiToEth(rawEth);
    const formattedUsdc = formatUSDC(rawUsdc);

    console.log(`   ETH: ${formattedEth} (${rawEth} wei)`);
    console.log(`   USDC: ${formattedUsdc} (${rawUsdc} microUSDC)`);

    return {
      usdc: formattedUsdc,
      eth: formattedEth,
      rawUsdc,
      rawEth,
    };
  } catch (error) {
    console.error("Failed to get wallet balance:", error);
    return {
      usdc: "0.00",
      eth: "0.000000",
      rawUsdc: "0",
      rawEth: "0",
    };
  }
}

/**
 * Get funding instructions for a wallet
 */
export async function getWalletFundingInfo(
  walletAddress: string,
  walletId: string,
): Promise<{
  walletAddress: string;
  walletId: string;
  network: string;
  asset: string;
  instructions: string;
  faucetUrl?: string;
}> {
  const { network } = config.x402;
  const isTestnet = network === "base-sepolia";

  return {
    walletAddress,
    walletId,
    network: isTestnet ? "Base Sepolia (Testnet)" : "Base (Mainnet)",
    asset: "USDC",
    instructions: `Send USDC to ${walletAddress} on ${isTestnet ? "Base Sepolia testnet" : "Base mainnet"} to fund the wallet.`,
    faucetUrl: isTestnet ? "https://faucet.circle.com/" : undefined,
  };
}
