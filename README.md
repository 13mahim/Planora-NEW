# Planora — Event Management Platform

> A full-stack event management platform where users can create, join, and manage events with support for public/private events, invitations, payments, and reviews.

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | fahad13mahim@gmail.com | 123456 |

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | [https://planora-new-frontend.vercel.app](https://planora-new-frontend.vercel.app) |
| Backend API | [https://planora-new-backend.vercel.app/api](https://planora-new-backend.vercel.app/api) |
| Health Check | [https://planora-new-backend.vercel.app/api/health](https://planora-new-backend.vercel.app/api/health) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL + Prisma ORM (Neon) |
| Auth | JWT (Access + Refresh Token) + Firebase |
| Payment | SSLCommerz |
| Email | Nodemailer |
| Deployment | Vercel |

---

## Project Structure

```
planora/
├── frontend/               # React + Vite client
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── context/        # Auth context
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript types
│   └── vercel.json
│
└── backend/                # Express.js API server
    ├── src/
    │   ├── controllers/    # Route handlers
    │   ├── middlewares/    # Auth, validation, error handling
    │   ├── routes/         # API route definitions
    │   └── lib/            # Prisma, JWT, Email utilities
    ├── prisma/
    │   └── schema.prisma   # Database schema
    └── vercel.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (Neon recommended)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET, etc.
npx prisma migrate dev
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
# App runs on http://localhost:3000
```

---

## Environment Variables

### Backend `.env`
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
CLIENT_URL=https://planora-new-frontend.vercel.app
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_...
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
```

### Frontend `.env`
```env
VITE_API_URL=https://planora-new-backend.vercel.app/api
```

---

## API Overview

**Base URL:** `https://planora-new-backend.vercel.app/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login & get tokens |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/events` | Get all public events |
| POST | `/events` | Create new event |
| GET | `/events/:id` | Get event details |
| POST | `/participants/:eventId/join` | Join an event |
| GET | `/invitations` | Get user invitations |
| POST | `/reviews` | Submit a review |
| GET | `/admin/events` | Admin — all events |
| GET | `/admin/users` | Admin — all users |

---

## Event Join Logic

| Event Type | Privacy | Result |
|-----------|---------|--------|
| FREE | PUBLIC | Instantly **APPROVED** |
| PAID | PUBLIC | PENDING → Payment → **APPROVED** |
| FREE | PRIVATE | PENDING → Organizer approves |
| PAID | PRIVATE | PENDING → Payment → Organizer approves |

---

## Features

- User authentication with JWT + Firebase
- Create & manage events (public/private, free/paid)
- Invitation system for private events
- SSLCommerz payment integration
- Email notifications via Nodemailer
- Review & rating system
- Admin panel for platform management
- Real-time notifications
- Fully deployed on Vercel

---

## License

MIT © Planora Team
