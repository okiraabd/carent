import { prisma } from '../src/lib/prisma';

async function main() {
  const maintenance = await prisma.maintenanceRecord.findMany();
  console.log("Maintenance records:", maintenance);

  const cameras = await prisma.camera.findMany();
  console.log("Cameras:");
  cameras.forEach(c => console.log(`- ${c.code}: ${c.status}`));

  const bookings = await prisma.booking.findMany({
    where: { status: { in: ['ACTIVE_RENTAL', 'OVERDUE'] } }
  });
  console.log("Active/Overdue Bookings:", bookings.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
