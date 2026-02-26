# SaaS File Management System

A comprehensive, subscription-based file management system with tiered limit enforcement, featuring a robust Express/Prisma backend and a premium Next.js frontend.

## 🚀 Key Features

- **Tiered Subscriptions**: Free, Silver, Gold, and Diamond plans with dynamic quotas.
- **Limit Enforcement**: Server-side middleware prevents exceeding plan limits (folders, nesting, file size).
- **Secure Authentication**: JWT-based auth with admin-authorized routes.
- **Rich File Explorer**: Premium UI with grid/list views, breadcrumbs, and real-time search.
- **Hierarchical Folders**: Deep nesting support with automatic level calculation.
- **Admin Dashboard**: Manage subscription packages and system limits.

## 🏗️ Project Structure

- `backend/`: Node.js, Express, TypeScript, Prisma (PostgreSQL).
- `frontend/`: Next.js 15, Tailwind CSS, Lucide Icons, Framer Motion.

## 🛠️ Local Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm/yarn

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (create `.env`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   JWT_SECRET="your_secret_key"
   PORT=5000
   ```
4. Generate Prisma client & Apply migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
5. Seed the database (Default Admin & Packages):
   ```bash
   npx prisma db seed
   ```
6. Start development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## 🔐 Default Admin Credentials
Access the admin dashboard at `/admin` (or after logging in) with:
- **Email**: `admin@example.com`
- **Password**: `admin123`

## 📄 License
This project is licensed under the MIT License.
