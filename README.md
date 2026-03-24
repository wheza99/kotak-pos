# Pabrik Startup

Platform untuk membangun startup dari ide hingga MVP. Validasi ide, bangun produk, dan luncurkan startup Anda dengan cepat.

## Project Structure

```
pabrik-startup/
├── landing/          # Astro landing page (Port 3000)
├── server/           # Hono API server (Port 4000)
├── docker-compose.yml
└── .env.example
```

## Quick Start

### Development

```bash
# Landing page
cd landing
npm install
npm run dev

# Server (di terminal terpisah)
cd server
npm install
npm run dev
```

### Docker

```bash
# Copy environment variables
cp .env.example .env

# Build dan jalankan semua services
docker-compose up --build

# Atau jalankan di background
docker-compose up -d --build
```

- Landing: http://localhost:3000
- Server: http://localhost:4000

## Tech Stack

- **Landing**: Astro 6.x, React 19, Tailwind CSS 4, shadcn/ui
- **Server**: HonoJS, TypeScript, Privy, x402 Payments

## Author

Built with ❤️ by [pabrikstartup.id](https://pabrikstartup.id)
