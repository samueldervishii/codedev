# DevHub

A Reddit-like platform for developers. Share code, discuss ideas, and connect with developers.

## Tech Stack

- **Frontend:** React, React Router, TanStack Query, Zustand, Tailwind CSS
- **Backend:** Express.js, Mongoose, MongoDB Atlas
- **Monorepo:** Turborepo, pnpm workspaces
- **Language:** TypeScript (end-to-end)

## Setup

```bash
# Install dependencies
pnpm install

# Create apps/api/.env
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Start development (API on :5000, Web on :5173)
pnpm dev

# Seed database (1 user, 20 communities, 100 posts)
cd apps/api && pnpm seed
# Login: devmaster@devhub.dev / Password123!
```

## Project Structure

```
apps/
  api/        Express backend
  web/        Vite + React frontend
packages/
  shared/     Zod schemas, TypeScript types, constants
  tsconfig/   Shared TypeScript configs
```

## Features

- JWT authentication (access + refresh tokens)
- Communities (create, join, leave)
- Posts (text, link, code with syntax highlighting)
- Threaded comments
- Voting with karma system
- User profiles and settings
- Search and trending feeds
- Collapsible sidebar
