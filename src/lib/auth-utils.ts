import { createClient } from "./supabase/server";
import { prisma } from "./prisma";

export async function requireUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  if (!dbUser || !dbUser.isActive) {
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
