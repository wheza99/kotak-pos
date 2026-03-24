// ============================================
// PRICING TYPES
// ============================================

export type X402Network = "base" | "base-sepolia";

export interface PricingConfig {
  price: string;
  description: string;
  maxTimeoutSeconds: number;
}

// ============================================
// ROUTES PRICING
// ============================================
// Ubah harga di sini sesuai kebutuhan

export const pricing: Record<string, PricingConfig> = {
  "/api/agents": {
    price: "$0.01",
    description: "Agents API - create, list, delete",
    maxTimeoutSeconds: 60,
  },
};

// ============================================
// HELPER: Get pricing info
// ============================================

export function getPricing(route: string): PricingConfig | undefined {
  return pricing[route];
}

export function getAllPricing(): Record<string, PricingConfig> {
  return pricing;
}

export function getPricingRoutes(): string[] {
  return Object.keys(pricing);
}

// ============================================
// HELPER: Build x402 routes for middleware
// ============================================

export function buildX402Routes(network: X402Network) {
  const routes: Record<string, {
    price: string;
    network: X402Network;
    config: {
      description: string;
      mimeType: string;
      maxTimeoutSeconds: number;
    };
  }> = {};

  for (const [path, config] of Object.entries(pricing)) {
    routes[path] = {
      price: config.price,
      network: network,
      config: {
        description: config.description,
        mimeType: "application/json",
        maxTimeoutSeconds: config.maxTimeoutSeconds,
      },
    };
  }

  return routes;
}
