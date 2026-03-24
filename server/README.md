# Pabrik Startup Server

Backend API untuk Pabrik Startup dengan integrasi **Privy x402 payments** dan **HonoJS**.

## Features

- ✅ **x402 Payment Protocol** - Charge USDC untuk akses API
- ✅ **Privy Integration** - Server-side wallet management
- ✅ **Agent Wallet** - AI agents bisa membayar untuk API calls
- ✅ **HonoJS** - Fast, lightweight web framework
- ✅ **TypeScript** - Full type safety

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` dengan Privy credentials:

```env
PRIVY_APP_ID=your_app_id
PRIVY_APP_SECRET=your_app_secret
PRIVY_AUTH_PRIVATE_KEY=your_auth_private_key
X402_PAY_TO_ADDRESS=your_wallet_address
X402_NETWORK=base-sepolia  # atau 'base' untuk mainnet
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Open API

```bash
open http://localhost:3000
```

## API Endpoints

### Public Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | API info dan dokumentasi |
| `GET /health` | Health check |
| `GET /api/status` | API status dan konfigurasi |

### Premium Endpoints (x402 Payment Required)

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/premium/insights` | $0.01 | AI-powered insights |
| `GET /api/premium/report` | $0.05 | Detailed analysis report |
| `GET /api/premium/analysis` | $0.10 | Deep market analysis |

### Agent Endpoints (Server-side Wallet)

| Endpoint | Description |
|----------|-------------|
| `GET /api/agent/wallet` | Get agent wallet info |
| `GET /api/agent/fund` | Get funding instructions |
| `GET /api/agent/balance` | Get wallet balance |
| `GET /api/agent/pay/insights` | Agent pays for insights |
| `GET /api/agent/pay/report` | Agent pays for report |
| `GET /api/agent/pay/analysis` | Agent pays for analysis |
| `POST /api/agent/pay` | Agent pays any x402 API |

## Project Structure

```
server/
├── src/
│   ├── index.ts           # Main server & routes
│   └── lib/
│       └── agent-payment.ts  # Privy & x402 client
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PRIVY_APP_ID` | Privy application ID | ✅ |
| `PRIVY_APP_SECRET` | Privy app secret | ✅ |
| `PRIVY_AUTH_PRIVATE_KEY` | Wallet signing key | ✅ |
| `PRIVY_AUTH_ID` | Key quorum ID | ❌ |
| `X402_PAY_TO_ADDRESS` | Payment recipient | ✅ |
| `X402_NETWORK` | `base` atau `base-sepolia` | ✅ |
| `AGENT_WALLET_ID` | Existing wallet ID | ❌ |
| `PORT` | Server port (default: 3000) | ❌ |

## Resources

- [Privy Documentation](https://docs.privy.io/)
- [x402 Protocol](https://github.com/coinbase/x402)
- [HonoJS Documentation](https://hono.dev/)
- [PayAI Facilitator](https://payai.network/)

---

Built with ❤️ by [pabrikstartup.id](https://pabrikstartup.id)
