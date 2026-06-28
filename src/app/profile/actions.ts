"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-utils";
import { createClient } from "@/lib/supabase/server";

export async function saveProfile(formData: FormData) {
  let user;
  try {
    const auth = await requireUser();
    user = auth.user;
  } catch (error) {
    return { error: "Unauthorized" };
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
        role: "CUSTOMER", // Default role, prevents privilege escalation
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

export async function updatePassword(formData: FormData) {
  let user;
  try {
    const auth = await requireUser();
    user = auth.user;
  } catch (error) {
    return { error: "Unauthorized" };
  }

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!oldPassword) {
    return { error: "Password lama wajib diisi" };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password baru harus minimal 6 karakter" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok" };
  }

  try {
    const supabase = await createClient();

    // Verifikasi password lama dengan mencoba sign-in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: oldPassword,
    });

    if (signInError) {
      return { error: "Password lama salah" };
    }

    // Update ke password baru
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Update password error:", error);
    return { error: error.message || "Gagal mengubah password" };
  }
}

