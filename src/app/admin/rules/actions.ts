"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function updateBusinessRules(category: string, formData: FormData) {
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

  try {
    // Ambil semua rules di category ini untuk referensi
    const currentRules = await prisma.businessRule.findMany({
      where: { category: category as any }
    });

    await prisma.$transaction(async (tx) => {
      for (const rule of currentRules) {
        // Ambil nilai dari formData berdasarkan rule.key
        const valueString = formData.get(`value_${rule.key}`) as string;
        const isActiveStr = formData.get(`active_${rule.key}`);
        const isActive = isActiveStr === 'on';

        if (valueString !== null && valueString !== undefined) {
          // Parse value. Jika number di db, kita coba parse sebagai number
          let parsedValue: any = valueString;
          if (typeof rule.value === 'number') {
            parsedValue = parseFloat(valueString);
            if (isNaN(parsedValue)) parsedValue = 0;
          } else if (typeof rule.value === 'boolean') {
            parsedValue = valueString === 'true';
          }

          await tx.businessRule.update({
            where: { id: rule.id },
            data: {
              value: parsedValue,
              isActive: isActive,
              updatedBy: user.id
            }
          });
        }
      }
    });

    revalidatePath("/admin/rules");
  } catch (error: any) {
    console.error("Error updating business rules:", error);
    // In a real app we'd handle error states, but for now just console.error
  }
}
