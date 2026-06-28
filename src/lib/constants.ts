// App-wide constants

export const APP_NAME = "Carent";
export const APP_DESCRIPTION =
  "Sistem Penyewaan Action Camera — Sewa kamera premium untuk petualanganmu";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Role-based route prefixes
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",

  // Customer routes
  katalog: "/katalog",
  booking: "/booking",
  pesanan: "/pesanan",
  profil: "/profil",

  // Admin routes
  adminDashboard: "/admin/dashboard",
  bookingMasuk: "/admin/booking-masuk",
  verifikasi: "/admin/verifikasi",
  transaksiAktif: "/admin/transaksi-aktif",
  checkout: "/admin/checkout",
  checkin: "/admin/checkin",
  inventaris: "/admin/inventaris",
  maintenance: "/admin/maintenance",

  // Manager routes
  managerDashboard: "/manager/dashboard",
  keuangan: "/manager/keuangan",
  pelanggan: "/manager/pelanggan",
  aset: "/manager/aset",
  pengaturanHarga: "/manager/pengaturan/harga",
  pengaturanDeposit: "/manager/pengaturan/deposit",
  pengaturanDenda: "/manager/pengaturan/denda",
  pengaturanPembatalan: "/manager/pengaturan/pembatalan",
} as const;

// Role-based redirect after login
export const ROLE_REDIRECTS = {
  CUSTOMER: ROUTES.katalog,
  ADMIN: ROUTES.adminDashboard,
  MANAGER: ROUTES.managerDashboard,
} as const;

// Status colors for UI badges
export const BOOKING_STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "bg-gray-500/20 text-gray-400", icon: "FileText" },
  AWAITING_PAYMENT: { label: "Menunggu Pembayaran", color: "bg-yellow-500/20 text-yellow-400", icon: "Clock" },
  REJECTED_PAYMENT: { label: "Pembayaran Ditolak", color: "bg-red-500/20 text-red-400", icon: "XCircle" },
  CONFIRMED: { label: "Dikonfirmasi", color: "bg-blue-500/20 text-blue-400", icon: "CheckCircle" },
  ACTIVE_RENTAL: { label: "Sedang Disewa", color: "bg-emerald-500/20 text-emerald-400", icon: "Play" },
  DUE_TODAY: { label: "Jatuh Tempo Hari Ini", color: "bg-orange-500/20 text-orange-400", icon: "AlertTriangle" },
  OVERDUE: { label: "Terlambat", color: "bg-red-500/20 text-red-400", icon: "AlertOctagon" },
  COMPLETED: { label: "Selesai", color: "bg-green-500/20 text-green-400", icon: "CheckCircle2" },
  CANCELLED: { label: "Dibatalkan", color: "bg-gray-500/20 text-gray-400", icon: "Ban" },
  EXPIRED: { label: "Kadaluarsa", color: "bg-gray-500/20 text-gray-400", icon: "TimerOff" },
  NO_SHOW: { label: "Tidak Hadir", color: "bg-red-500/20 text-red-400", icon: "UserX" },
} as const;

export const CAMERA_STATUS_CONFIG = {
  AVAILABLE: { label: "Tersedia", color: "bg-emerald-500/20 text-emerald-400" },
  BOOKED: { label: "Dibooking", color: "bg-blue-500/20 text-blue-400" },
  RENTED: { label: "Disewa", color: "bg-purple-500/20 text-purple-400" },
  INSPECTION: { label: "Inspeksi", color: "bg-yellow-500/20 text-yellow-400" },
  MAINTENANCE: { label: "Maintenance", color: "bg-orange-500/20 text-orange-400" },
  DAMAGED: { label: "Rusak", color: "bg-red-500/20 text-red-400" },
} as const;

export const CUSTOMER_STATUS_CONFIG = {
  NEW: { label: "Baru", color: "bg-cyan-500/20 text-cyan-400" },
  REGULAR: { label: "Reguler", color: "bg-blue-500/20 text-blue-400" },
  VIP: { label: "VIP", color: "bg-amber-500/20 text-amber-400" },
  INACTIVE: { label: "Tidak Aktif", color: "bg-gray-500/20 text-gray-400" },
} as const;

// Activity options for booking
export const ACTIVITY_OPTIONS = [
  "Hiking",
  "Touring",
  "Snorkeling",
  "Diving",
  "Vlog",
  "Travel",
  "Olahraga",
  "Event",
  "Lainnya",
] as const;

// Identity card types
export const CARD_TYPES = ["KTP", "SIM", "Paspor", "Kartu Pelajar"] as const;
