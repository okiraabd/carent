import { prisma } from "../src/lib/prisma";
import { fakerID_ID as faker } from "@faker-js/faker";
import { addDays, subDays, isBefore, isAfter } from "date-fns";

async function main() {
  console.log("🌱 Seeding database with 3 months of dummy data...");

  // ============================================================
  // CLEANUP (Optional for idempotency in local dev)
  // ============================================================
  console.log("🧹 Cleaning up old data...");
  // Disable foreign key checks for SQLite if used, but we are using Postgres
  // For Postgres, we can just delete in reverse dependency order or use TRUNCATE CASCADE
  // Since we might not want to truncate everything if there are real users, we will just create if not exists.
  // But for a clean seed, let's just delete the transactional data.
  await prisma.penalty.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.depositTransaction.deleteMany();
  await prisma.inspectionRecord.deleteMany();
  await prisma.bookingItemAccessory.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  
  // We won't delete users/cameras to avoid breaking manual entries, just upsert.

  // ============================================================
  // BUSINESS RULES
  // ============================================================
  console.log("📋 Creating business rules...");

  const rules = [
    { category: "PENALTY" as const, key: "late_tolerance_minutes", value: 60, description: "Toleransi keterlambatan (menit)" },
    { category: "PENALTY" as const, key: "late_penalty_per_hour", value: 25000, description: "Denda per jam" },
    { category: "PENALTY" as const, key: "late_penalty_per_day", value: 150000, description: "Denda per hari" },
    { category: "PENALTY" as const, key: "late_penalty_mode", value: "per_hour", description: "Mode denda: per_hour/per_day" },
    { category: "BOOKING" as const, key: "booking_payment_percentage", value: 30, description: "DP %" },
    { category: "BOOKING" as const, key: "booking_expiry_hours", value: 24, description: "Batas pembayaran (jam)" },
    { category: "DEPOSIT" as const, key: "deposit_high_value_percentage", value: 50, description: "Deposit barang mahal %" },
  ];

  for (const rule of rules) {
    await prisma.businessRule.upsert({
      where: { key: rule.key },
      update: { value: rule.value },
      create: { ...rule, isActive: true },
    });
  }

  // ============================================================
  // CAMERAS & ACCESSORIES
  // ============================================================
  console.log("📷 Creating cameras and accessories...");

  const cameras = [
    { code: "GP-001", brand: "GoPro", model: "Hero 13 Black", dailyRate: 75000, isHighValue: true, status: "AVAILABLE" },
    { code: "GP-002", brand: "GoPro", model: "Hero 13 Black", dailyRate: 75000, isHighValue: true, status: "AVAILABLE" },
    { code: "DJI-001", brand: "DJI", model: "Osmo Action 5 Pro", dailyRate: 85000, isHighValue: true, status: "AVAILABLE" },
    { code: "DJI-002", brand: "DJI", model: "Osmo Action 4", dailyRate: 65000, isHighValue: false, status: "AVAILABLE" },
    { code: "INS-001", brand: "Insta360", model: "X4", dailyRate: 100000, isHighValue: true, status: "AVAILABLE" },
  ];

  for (const cam of cameras) {
    await prisma.camera.upsert({
      where: { code: cam.code },
      update: {},
      create: {
        code: cam.code,
        brand: cam.brand,
        model: cam.model,
        specs: {},
        dailyRate: cam.dailyRate,
        weekendRate: cam.dailyRate * 1.5,
        weeklyRate: cam.dailyRate * 5,
        purchasePrice: 7000000,
        purchaseDate: new Date("2024-01-01"),
        isHighValue: cam.isHighValue,
        storageLocation: "Rak A",
        conditionScore: 10,
        status: cam.status as any,
      },
    });
  }

  const accessories = [
    { name: "Chest Mount Harness", type: "mount", stock: 5, dailyRate: 10000, replacementCost: 150000 },
    { name: "Extra Battery", type: "battery", stock: 10, dailyRate: 10000, replacementCost: 350000 },
    { name: "128GB MicroSD Card", type: "storage", stock: 8, dailyRate: 5000, replacementCost: 150000 },
  ];

  for (const acc of accessories) {
    await prisma.accessory.upsert({
      where: { id: acc.name }, // This will fail if id is uuid, but my schema has `id` as default UUID. Let's use name as unique if possible.
      // Wait, Accessory doesn't have unique name by default?
      // Let's just create them if the table is empty.
      update: {},
      create: { ...acc },
    }).catch(async () => {
      // If no unique constraint on name, just findFirst and create if not exists
      const existing = await prisma.accessory.findFirst({ where: { name: acc.name } });
      if (!existing) await prisma.accessory.create({ data: acc });
    });
  }

  // ============================================================
  // DUMMY USERS & PROFILES
  // ============================================================
  console.log("👥 Generating 20 dummy customers...");
  const customerProfileIds: string[] = [];

  for (let i = 0; i < 20; i++) {
    const id = faker.string.uuid();
    const user = await prisma.user.create({
      data: {
        id,
        email: faker.internet.email(),
        role: "CUSTOMER",
      },
    });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        fullName: faker.person.fullName(),
        phone: faker.phone.number({ style: 'national' }),
        city: faker.location.city(),
        profession: faker.person.jobTitle(),
      },
    });

    customerProfileIds.push(profile.id);
  }

  // ============================================================
  // TRANSACTIONS (3 MONTHS)
  // ============================================================
  console.log("📅 Generating 260 bookings (120 in June, 80 in May, 60 in April)...");
  const cameraRecords = await prisma.camera.findMany();
  const accessoryRecords = await prisma.accessory.findMany();

  const today = new Date("2026-06-29T00:00:00Z");

  for (let i = 0; i < 260; i++) {
    const customerProfileId = faker.helpers.arrayElement(customerProfileIds);
    
    let fromDate, toDate;
    if (i < 120) {
      // June 2026
      fromDate = new Date("2026-06-01T00:00:00Z");
      toDate = subDays(today, 1);
    } else if (i < 200) {
      // May 2026
      fromDate = new Date("2026-05-01T00:00:00Z");
      toDate = new Date("2026-05-31T23:59:59Z");
    } else {
      // April 2026
      fromDate = new Date("2026-04-01T00:00:00Z");
      toDate = new Date("2026-04-30T23:59:59Z");
    }
    
    const startDate = faker.date.between({ from: fromDate, to: toDate });
    const durationDays = faker.number.int({ min: 1, max: 7 });
    const endDate = addDays(startDate, durationDays);
    
    // Determine status based on time
    let status: any = "AWAITING_PAYMENT";
    if (isBefore(endDate, today)) {
      // 95% COMPLETED, 5% CANCELLED, NO OVERDUE
      status = faker.helpers.arrayElement(Array(19).fill("COMPLETED").concat(["CANCELLED"]));
    } else if (isBefore(startDate, today) && isAfter(endDate, today)) {
      status = "ACTIVE_RENTAL";
    } else {
      status = faker.helpers.arrayElement(["CONFIRMED", "CONFIRMED", "AWAITING_PAYMENT"]);
    }

    const bookingCode = `TRX-${faker.string.alphanumeric(6).toUpperCase()}`;
    const selectedCam = faker.helpers.arrayElement(cameraRecords);
    
    // Basic price calculation
    const totalAmount = Number(selectedCam.dailyRate) * durationDays;
    const securityDeposit = selectedCam.isHighValue ? 500000 : 200000;

    const createdAtDate = subDays(startDate, faker.number.int({ min: 1, max: 7 }));
    const booking = await prisma.booking.create({
      data: {
        bookingCode: bookingCode,
        profileId: customerProfileId,
        startDate,
        endDate,
        dueTime: endDate,
        duration: durationDays,
        status,
        totalAmount,
        subtotal: totalAmount,
        securityDepositAmount: securityDeposit,
        bookingPaymentAmount: totalAmount * 0.3,
        paymentStatus: status === "AWAITING_PAYMENT" ? "UNPAID" : "VERIFIED",
        checkoutAt: (status === "COMPLETED" || status === "ACTIVE_RENTAL" || status === "OVERDUE") ? startDate : undefined,
        checkinAt: status === "COMPLETED" ? endDate : undefined,
        notes: faker.lorem.sentence(),
        createdAt: createdAtDate,
        expiresAt: addDays(createdAtDate, 1),
      },
    });

    // Create Booking Item
    await prisma.bookingItem.create({
      data: {
        bookingId: booking.id,
        cameraId: selectedCam.id,
        dailyRate: selectedCam.dailyRate,
        subtotal: totalAmount,
      },
    });

    // Create Payment if not unpaid
    if (booking.paymentStatus !== "UNPAID") {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalAmount,
          type: "BOOKING_PAYMENT",
          status: "VERIFIED",
          verifiedAt: booking.createdAt,
        },
      });
    }

    // Create Penalty if OVERDUE
    if (status === "OVERDUE") {
      // Find the user ID associated with this profile
      const profile = await prisma.profile.findUnique({ where: { id: customerProfileId } });
      await prisma.penalty.create({
        data: {
          bookingId: booking.id,
          amount: 150000,
          type: "LATE_RETURN",
          description: "Keterlambatan pengembalian",
          createdBy: profile!.userId, 
        },
      });
    }
  }

  console.log("✅ 3 Months Dummy Data Generation Completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
