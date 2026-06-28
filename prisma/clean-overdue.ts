import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("🧹 Membersihkan status keterlambatan (OVERDUE)...");
  
  const result = await prisma.booking.updateMany({
    where: {
      status: 'OVERDUE'
    },
    data: {
      status: 'COMPLETED'
    }
  });

  console.log(`✅ Berhasil menyelesaikan ${result.count} pesanan yang terlambat!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
