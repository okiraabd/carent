# Carent — Action Camera Rental Management System

Carent is a modern, enterprise-grade web application built to manage action camera rentals efficiently. It features a robust Next.js frontend, Prisma ORM for database management, and a highly interactive Admin Analytics Dashboard.

## 🚀 Key Features

### 1. Enterprise Analytics Dashboard (`/admin/analytics`)
- **Real-time KPI Metrics**: Tracks Gross Revenue, Completed Bookings, Available Cameras, and Total Inventory. *(Note: Gross Revenue intelligently excludes Security Deposits for accurate accounting).*
- **Dynamic Time Filtering**: Filter analytics by the last 30 days, this month, this year, or all time.
- **Peak Analysis**: Automatically calculates and highlights Peak Revenue, Peak Bookings, and Low Season (Peak Availability) based on the selected timeframe.
- **Interactive Recharts**: Visualizes Revenue Trends and Booking Volumes with smooth responsive charts.

### 2. Drill-Down Analytics (Smart Charts)
- **Clickable Data Nodes**: Administrators can click on any data point (bar or line node) on the Analytics Dashboard.
- **Context-Aware Navigation**: 
  - Clicking on the **Revenue Trend** line chart redirects to the Bookings Module filtered by the exact payment verification date.
  - Clicking on the **Booking Volume** bar chart redirects to the Bookings Module filtered by the exact rental start date.

### 3. Smart Booking Management (`/admin/bookings`)
- Comprehensive table of all rental transactions.
- **URL Parameter Filtering**: Automatically filters bookings based on `rentalStartDate` or `paymentVerifiedDate` passed from the Analytics dashboard.
- Displays clear UI filter badges to let admins know when they are viewing a filtered state.

### 4. Robust Database Seeding
- `prisma/seed.ts` is capable of generating massive amounts of realistic dummy data (customers, cameras, accessories, and hundreds of bookings) to thoroughly test the analytics and management modules.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **Charts**: [Recharts](https://recharts.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database Provider**: PostgreSQL (Supabase)
- **Utilities**: `date-fns` for robust date manipulation

## 🚦 Getting Started

First, ensure you have set up your PostgreSQL database and connected it via `.env`:
```env
DATABASE_URL="postgresql://..."
```

Run the database migrations and seed the data:
```bash
npx prisma generate
npx prisma db push
npx tsx --env-file=.env prisma/seed.ts
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.
