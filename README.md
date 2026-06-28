<div align="center">
  <br />
  <h1>📸 Carent</h1>
  <p><strong>Action Camera Rental Management System</strong></p>
  <p>Enterprise-grade web application untuk operasional dan manajemen penyewaan action camera modern.</p>
</div>

<br />

## 📖 Tentang Proyek

**Carent** adalah platform terintegrasi yang dirancang khusus untuk bisnis penyewaan *action camera* premium seperti GoPro, DJI, dan Insta360. Berbeda dengan sekadar katalog online, Carent berfungsi sebagai sistem manajemen operasional hulu-ke-hilir (*end-to-end*). 

Sistem ini memfasilitasi transaksi penyewaan bagi **Pelanggan** (katalog, pemesanan, profil), sekaligus menyediakan **Dasbor Admin** yang komprehensif bagi pengelola bisnis untuk melacak pemesanan, verifikasi pembayaran, manajemen inventaris, perawatan unit (*maintenance*), dan laporan analitik finansial secara *real-time*.

## ✨ Fitur Utama

### 🛒 Sisi Pelanggan (Customer Facing)
- **Katalog Kamera Real-time**: Menampilkan daftar kamera yang tersedia beserta spesifikasi, harga sewa (harian/mingguan), dan kondisi.
- **Pemesanan Mudah (Booking)**: Sistem *booking* yang cerdas untuk memilih tanggal penyewaan dan menghitung otomatis subtotal, durasi, dan deposit.
- **Manajemen Profil & Keamanan**: Melengkapi profil pengguna (KTP/Identitas) sebagai syarat penyewaan dan fitur pembaruan *password* terenkripsi (didukung Supabase Auth).
- **Riwayat Transaksi**: Pelanggan dapat melacak status pesanan mereka (Menunggu Pembayaran, Aktif, Selesai, dll).

### 💼 Sisi Admin (Operational Dashboard)
- **Dasbor Analitik Interaktif**: Visualisasi data *real-time* untuk metrik KPI seperti Total Pendapatan, Volume Transaksi, Tingkat Kerusakan (*Damage Rate*), dan Analisis Puncak (*Peak Season*). Dilengkapi fitur *drill-down* interaktif untuk membedah data melalui Recharts.
- **Manajemen Pemesanan**: Tabel komprehensif untuk memonitor, menyetujui, dan memverifikasi pembayaran bukti transfer dari pelanggan.
- **Inventaris & Aset**: Pelacakan unit kamera dan aksesoris (Tersedia, Disewa, Sedang Diperbaiki, Rusak).
- **Modul Pemeliharaan (Maintenance)**: Pencatatan riwayat kerusakan, biaya perbaikan, dan pengurangan nilai aset (*depreciation*) untuk manajemen aset yang lebih baik.
- **Manajemen Pengguna (CRM)**: Melihat riwayat lengkap setiap pelanggan, mengkalkulasi metrik loyalitas pelanggan berdasarkan data transaksi secara dinamis.
- **Business Rules**: Pengaturan aturan bisnis fleksibel seperti persentase deposit, denda keterlambatan, dll.

## 🛠 Teknologi yang Digunakan

Proyek ini dibangun di atas *stack* teknologi modern untuk menjamin skalabilitas, kecepatan, dan keamanan:

- **Framework**: [Next.js 15](https://nextjs.org) (App Router, Server Actions, Server Components)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) (Icons)
- **Autentikasi**: [Supabase Auth](https://supabase.com/auth) (Email/Password, JIT Provisioning, SSR support)
- **Database**: PostgreSQL (di-host pada Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Visualisasi Data**: [Recharts](https://recharts.org/)
- **Utilitas**: `date-fns` (manipulasi tanggal), `clsx` & `tailwind-merge`

---

## 🚀 Panduan Instalasi (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini secara lokal di mesin Anda.

### 1. Persyaratan Sistem
- [Node.js](https://nodejs.org/en/) (Versi 18.x atau lebih baru)
- Akun [Supabase](https://supabase.com/) untuk Database dan Autentikasi.

### 2. Kloning Repositori & Instalasi Dependensi
```bash
git clone https://github.com/okiraabd/carent.git
cd carent
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env` di *root directory* proyek Anda dan sesuaikan isinya dengan kredensial dari proyek Supabase Anda:
```env
# Database Prisma (Gunakan Connection Pool URI dari Supabase)
DATABASE_URL="postgresql://postgres.[PROYEK-ANDA]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROYEK-ANDA]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[PROYEK-ANDA].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."
```

### 4. Setup Database & Seeding
Inisialisasi skema Prisma ke dalam PostgreSQL dan buat data *dummy* (*Seeding*) untuk mempermudah pengujian Dasbor:
```bash
# Generate Prisma Client
npx prisma generate

# Sinkronisasi schema ke Supabase
npx prisma db push

# (Opsional) Jalankan Seeder untuk mengisi ribuan data dummy realistis
npx tsx --env-file=.env prisma/seed.ts
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 📂 Struktur Proyek

```text
carent/
├── prisma/                 # Prisma schema (schema.prisma) & Seeder (seed.ts)
├── src/
│   ├── app/                # Next.js App Router (Halaman & Layouts)
│   │   ├── (auth)/         # Rute autentikasi (Login, Register)
│   │   ├── admin/          # Dasbor Operasional Admin (Hanya akses Admin)
│   │   ├── api/            # API Routes 
│   │   ├── katalog/        # Halaman muka & Katalog Produk
│   │   └── profile/        # Manajemen Profil Pelanggan
│   ├── components/         # Reusable UI Components (Navbar, Buttons, Forms)
│   └── lib/                # Konfigurasi Utility (Prisma, Supabase clients, utils)
└── ...
```

## 🔒 Keamanan & Role-Based Access Control (RBAC)

Carent menggunakan model otorisasi multi-lapis.
- **Middleware Level**: Memeriksa keberadaan sesi (JWT Token dari Supabase) dan memastikan pengguna yang tidak sah dialihkan kembali ke `/login`.
- **Server Utility Level**: Menggunakan fungsi pembantu `requireUser()` dan `requireAdmin()` di dalam *Server Components* dan *Server Actions* (merujuk pada tabel lokal `User` di Prisma PostgreSQL) untuk menjamin perlindungan eskalasi hak istimewa (Privilege Escalation Prevention).

## 📝 Lisensi

Hak Cipta © 2026. Proyek ini dibuat sebagai sistem perangkat lunak untuk kebutuhan internal manajemen penyewaan (Rental Management).
