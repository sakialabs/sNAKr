# sNAKr Web App

Next.js web application for sNAKr - Shared household inventory intelligence.

## Tech Stack

- **Framework**: Next.js 15.1.4 with App Router
- **Language**: TypeScript 5.7.3
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI primitives
- **State Management**: Zustand 5.0.2
- **HTTP Client**: Axios 1.7.9
- **Authentication**: NextAuth 4.24.11 + Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your Supabase credentials and API URL

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

### Linting

Run ESLint:

```bash
npm run lint
```

## Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── auth/              # Authentication pages (signin, signup)
│   ├── contact/           # Contact page
│   ├── fasoolya/          # Fasoolya introduction page
│   ├── households/        # Household management
│   ├── inventory/         # Inventory list and item details
│   ├── privacy/           # Privacy policy
│   ├── receipts/          # Receipt upload and review
│   ├── restock/           # Restock list
│   ├── settings/          # User settings
│   ├── terms/             # Terms of service
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── not-found.tsx      # 404 page
│   └── globals.css        # Global styles with sNAKr color tokens
├── components/            # React components (to be added)
├── lib/                   # Utility functions and configurations
│   └── utils.ts           # Tailwind utility helpers
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS with sNAKr colors
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Features

- ✅ Next.js 15 with App Router
- ✅ TypeScript 5.7.3 for type safety (strict mode enabled)
- ✅ Tailwind CSS with sNAKr brand colors (grape, apple, strawberry)
- ✅ Complete routing structure (households, inventory, receipts, restock, settings)
- ✅ Major pages (home, about, contact, Fasoolya, auth, privacy, terms, 404)
- ✅ Radix UI components for accessibility
- ✅ Framer Motion for smooth transitions
- ✅ Dark mode support
- ✅ Responsive design
- ✅ ESLint and type checking configured
- ✅ Docker support (development and production)
- 🚧 Supabase authentication (coming in task 0.4.4-0.4.5)
- 🚧 API client setup (coming in task 0.4.8)
- 🚧 Error handling and toast notifications (coming in task 0.4.9)

## Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
- `NEXTAUTH_URL`: Your app URL (default: http://localhost:3000)
- `NEXTAUTH_SECRET`: Secret for NextAuth session encryption

## Docker Support

### Development

```bash
docker build -f Dockerfile.dev -t snakr-web-dev .
docker run -p 3000:3000 snakr-web-dev
```

### Production

```bash
docker build -f Dockerfile.prod -t snakr-web .
docker run -p 3000:3000 snakr-web
```

## Deployment

The app is configured for deployment on:
- Vercel (recommended for Next.js)
- Netlify (netlify.toml included)
- Docker containers (Dockerfiles included)

## Contributing

See the main project README for contribution guidelines.

## License

See the main project LICENSE file.
