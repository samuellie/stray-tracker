# 🐾 Stray Tracker

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)]()
[![Cloudflare Workers](https://img.shields.io/badge/cloudflare-workers-orange)]()

> A community-driven platform for tracking and helping stray cats and dogs in your neighborhood. Join thousands of animal lovers in creating a safer world for our furry friends.

## 📋 Table of Contents

- [About The Project](#about-the-project)
  - [Problem Statement](#problem-statement)
  - [Solution](#solution)
  - [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Development](#development)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## 🌟 About The Project

### Problem Statement

Every day, countless stray animals roam our streets without proper care, food, or medical attention. Community members want to help but lack the tools to effectively track, monitor, and coordinate care for these animals. Traditional animal control services are often overwhelmed and under-resourced.

### Solution

Stray Tracker is a modern web application that empowers communities to take collective action in caring for stray animals. By providing an intuitive platform for tracking, sharing information, and coordinating efforts, we can significantly improve the lives of stray animals and strengthen community bonds.

### Key Features

- ✅ **User Registration & Profiles** - Create member accounts with personalized profiles
- ✅ **Photo Upload & Management** - Upload and organize photos of stray animals
- ✅ **Location Tracking** - Record and map sighting locations with GPS coordinates
- ✅ **Animal Profiles** - Create detailed profiles for individual animals
- ✅ **Community Feed** - Share sightings and updates with the community
- ✅ **Search & Filter** - Find animals by location, type, or other criteria
- ✅ **Mobile Responsive** - Access the platform from any device
- ✅ **Real-time Updates** - Get notified about new sightings in your area

## 🛠 Tech Stack

This project uses a modern, scalable tech stack optimized for performance and developer experience:

### Frontend

- **[TanStack Start](https://tanstack.com/start)** - Full-stack React framework
- **React 18** - UI library with modern hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **React Query** - Powerful data synchronization for web applications

### Backend & Infrastructure

- **[Cloudflare Workers](https://workers.cloudflare.com/)** - Serverless compute platform
- **[Cloudflare Pages](https://pages.cloudflare.com/)** - Static site hosting and deployment
- **[Cloudflare D1](https://www.cloudflare.com/products/d1/)** - Serverless database
- **[Cloudflare R2](https://www.cloudflare.com/products/r2/)** - Object storage for images
- **[Cloudflare Workers KV](https://www.cloudflare.com/products/workers-kv/)** - Key-value storage for caching

### Architecture Benefits

- ⚡ **Serverless** - No infrastructure management required
- 🌍 **Global CDN** - Fast loading worldwide
- 🔒 **Secure by default** - Built-in security features
- 💰 **Cost-effective** - Pay only for usage
- 🚀 **Auto-scaling** - Handles traffic spikes automatically

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package managers
- **Git** - Version control system
- **Cloudflare account** - For deployment and services

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/stray-tracker.git
   cd stray-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Setup

Setting up the development environment is simple - just run these two scripts:

```bash
# Initialize the local database with schema
npm run local:init

# Load sample data into the database
npm run local:load
```

That's it! The scripts will handle:

- Setting up the local D1 database
- Creating all necessary tables (users, animals, sightings)
- Loading sample data for development

**Database Integration:**

The application uses Cloudflare D1 database through Workers bindings:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { getBindings } from "~/utils/bindings";

const animalServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const env = getBindings();

  // Access D1 database through bindings
  const animals = await env.DB.prepare("SELECT * FROM animals WHERE status = ?")
    .bind("spotted")
    .all();

  return animals.results;
});
```

**Key Points:**

- D1 is accessed via `env.DB` binding (not DATABASE_URL)
- Use `env.DB.prepare()` for SQL queries
- Use `.bind()` for parameterized queries (prevents SQL injection)
- Use `.all()`, `.first()`, or `.run()` to execute queries
- Always use `getBindings()` from `~/utils/bindings` to access the database

### Development

1. **Start the development server**

   ```sh
    pnpm install
    pnpm dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000` to see the application running.

3. **Development workflow**
   - All source code lives in `/src`
   - Routes are defined using file-based routing in `/src/routes`
   - Components are in `/src/components`
   - Utilities and helpers are in `/src/utils`
   - Styles are in `/src/styles`

## 📁 Project Structure

```
stray-tracker/
├── public/                 # Static assets (icons, manifest, etc.)
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── DefaultCatchBoundary.tsx
│   │   ├── NotFound.tsx
│   │   ├── PostError.tsx
│   │   └── UserError.tsx
│   ├── routes/            # Application routes (file-based routing)
│   │   ├── __root.tsx     # Root layout component
│   │   ├── _pathlessLayout.tsx
│   │   ├── index.tsx      # Home page
│   │   ├── posts.tsx      # Posts listing page
│   │   ├── posts.index.tsx
│   │   ├── posts.$postId.tsx
│   │   ├── posts_.$postId.deep.tsx
│   │   ├── users.tsx      # Users listing page
│   │   ├── users.index.tsx
│   │   ├── users.$userId.tsx
│   │   ├── redirect.tsx
│   │   ├── deferred.tsx
│   │   ├── customScript[.]js.ts
│   │   ├── _pathlessLayout/
│   │   │   ├── _nested-layout.tsx
│   │   │   └── _nested-layout/
│   │   │       ├── route-a.tsx
│   │   │       └── route-b.tsx
│   │   └── api/           # API route handlers
│   │       ├── users.ts
│   │       └── users.$userId.ts
│   ├── styles/            # Global styles
│   │   └── app.css
│   ├── utils/             # Utility functions
│   │   ├── loggingMiddleware.tsx
│   │   ├── posts.tsx
│   │   ├── seo.ts
│   │   └── users.tsx
│   ├── Foo.ts            # Example utility file
│   ├── router.tsx        # Router configuration
│   ├── routeTree.gen.ts # Generated route tree
│   ├── server.ts         # Server configuration
│   └── start.tsx         # Application entry point
├── .gitignore
├── .prettierignore
├── package.json          # Project dependencies and scripts
├── pnpm-lock.yaml        # pnpm lock file
├── postcss.config.mjs    # PostCSS configuration
├── tailwind.config.mjs   # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
├── wrangler.json         # Cloudflare Workers configuration
└── README.md
```

## 🎯 Usage

### For Community Members

1. **Sign Up** - Create your member account
2. **Explore** - Browse recent sightings in your area
3. **Report Sighting** - Upload photos and location of stray animals
4. **Track Animals** - Follow specific animals you're helping
5. **Coordinate Care** - Connect with other community members

### For Animal Caretakers

1. **Create Animal Profiles** - Document animals you're caring for
2. **Update Status** - Track progress and needs
3. **Share Updates** - Keep the community informed
4. **Find Resources** - Connect with vets, shelters, and supplies

## 📚 API Documentation

### Core Endpoints

- `GET /api/animals` - List all animals with optional filtering
- `POST /api/animals` - Create a new animal profile
- `GET /api/animals/:id` - Get specific animal details
- `POST /api/sightings` - Report a new sighting
- `GET /api/sightings` - Get sightings with location data
- `POST /api/users/register` - Register a new user

### Authentication

All API requests require authentication via JWT tokens:

```bash
Authorization: Bearer <your_jwt_token>
```

## 🚀 Deployment

### Cloudflare Pages (Frontend)

1. **Connect repository** to Cloudflare Pages
2. **Build configuration**:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Deploy** automatically on git push

### Cloudflare Workers (Backend)

1. **Deploy Workers**:

   ```bash
   npm run deploy
   ```

2. **Set up custom domains** (optional)
3. **Configure environment variables** in Cloudflare dashboard

### Environment Variables

```env
NODE_ENV=production
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
DATABASE_URL=your_d1_database_url
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
JWT_SECRET=your_jwt_secret
```

## 🤝 Contributing

We love your input! We want to make contributing to this project as easy and transparent as possible.

### Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript** - All code must be typed
- **ESLint** - Follow provided linting rules
- **Prettier** - Code formatting is enforced
- **Conventional Commits** - Use conventional commit messages

### Local Development Setup

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm run test

# Format code
npm run format
```

### Pull Request Process

1. Ensure all tests pass
2. Update the README with details of changes if needed
3. Follow the pull request template
4. Get at least one approval before merging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TanStack Team** for the amazing TanStack Start framework
- **Cloudflare** for providing excellent serverless infrastructure
- **Open Source Community** for inspiration and contributions
- **Animal Welfare Organizations** for their dedication and expertise

---

<div align="center">

**Made with ❤️ for animals in need**

[🐕 Report a Sighting](#) • [📊 View Statistics](#) • [💬 Join Discussion](#)

</div>
