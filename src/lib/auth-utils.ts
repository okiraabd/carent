import { createClient } from "./supabase/server";
import { prisma } from "./prisma";

export async function requireUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  let dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  // JIT Provisioning & Sync: Auto-create or link Prisma User if missing
  if (!dbUser) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (existingByEmail) {
      // Link seeded admin user to real Supabase UUID
      dbUser = await prisma.user.update({
        where: { email: user.email },
        data: { id: user.id }
      });
    } else {
      // Create new customer
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          role: "CUSTOMER",
        }
      });
    }
  }

  if (!dbUser.isActive) {
    throw new Error("User not found or inactive");
  }

  return { user, dbUser };
}

export async function requireAdmin() {
  const { user, dbUser } = await requireUser();

  if (dbUser.role !== "ADMIN" && dbUser.role !== "MANAGER") {
    throw new Error("Forbidden: Insufficient privileges");
  }

  return { user, dbUser };
}
