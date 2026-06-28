"use server";

import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function saveProfile(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const profession = formData.get("profession") as string;

  if (!fullName || !phone) {
    return { error: "Nama lengkap dan nomor telepon wajib diisi" };
  }

  try {
    // Sinkronisasi data user dari Supabase auth.users ke tabel public.users Prisma
    // Ini diperlukan karena kita belum memiliki trigger otomatis di database
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email! },
      create: {
        id: user.id,
        email: user.email!,
        role: user.user_metadata?.role || "CUSTOMER",
      }
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        fullName,
        phone,
        city,
        profession,
      },
      create: {
        userId: user.id,
        fullName,
        phone,
        city,
        profession,
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Profile save error:", error);
    return { error: "Terjadi kesalahan saat menyimpan profil" };
  }
}
