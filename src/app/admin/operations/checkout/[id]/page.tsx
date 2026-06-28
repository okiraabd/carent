import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, UserSquare2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { CheckoutForm } from "./_components/checkout-form";

export const revalidate = 0;

export default async function CheckoutPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { 
      profile: true,
      items: { include: { camera: true } }
    },
  });

  if (!booking || booking.status !== "CONFIRMED") {
    // Usually we would show an error or redirect, but for simplicity let's just 404 if not found
    if (!booking) notFound();
  }

  const camera = booking.items[0]?.camera;
  const isHighValue = camera?.isHighValue || false;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <Link
        href="/admin/operations"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Proses Pengambilan Unit</h1>
        <p className="text-text-secondary font-mono">{booking.bookingCode}</p>
      </div>

      {booking.status === "ACTIVE_RENTAL" ? (
        <div className="glass-card p-12 text-center border-accent-success/20">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent-success/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-accent-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Checkout Berhasil</h2>
          <p className="text-text-secondary mb-8">Kamera telah diserahkan kepada pelanggan dan status pesanan aktif.</p>
          <Link href="/admin/operations" className="gradient-brand text-white px-6 py-3 rounded-lg font-medium inline-flex">
            Selesai
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-6 bg-surface-100/50">
              <h3 className="font-bold mb-4">Informasi Pelanggan</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-text-muted">Nama Lengkap</div>
                  <div className="font-medium">{booking.profile.fullName}</div>
                </div>
                <div>
                  <div className="text-text-muted">No. Handphone</div>
                  <div className="font-medium">{booking.profile.phone}</div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-bold mb-4">Unit Sewaan</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-text-muted">Kamera</div>
                  <div className="font-bold">{camera?.brand} {camera?.model}</div>
                  <div className="font-mono text-xs mt-1 text-text-muted">{camera?.code}</div>
                </div>
                <div>
                  <div className="text-text-muted">Durasi</div>
                  <div className="font-medium text-brand-400">{booking.duration} Hari</div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="glass-card p-6 sm:p-8">
              <h3 className="font-heading text-lg font-bold mb-6 border-b border-surface-200 pb-4 flex items-center gap-2">
                <UserSquare2 className="w-5 h-5 text-brand-400" />
                Form Serah Terima
              </h3>
              
              {isHighValue && (
                <div className="mb-6 p-4 rounded-xl bg-accent-warning/10 border border-accent-warning/20">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-accent-warning shrink-0" />
                    <div>
                      <div className="font-bold text-accent-warning text-sm">Perhatian: High Value Asset</div>
                      <div className="text-xs text-text-secondary mt-1">Kamera ini mewajibkan penitipan Security Deposit sebesar <strong className="text-text-primary">Rp 500.000</strong> tunai/transfer hari ini.</div>
                    </div>
                  </div>
                </div>
              )}

              <CheckoutForm 
                bookingId={booking.id} 
                isHighValue={isHighValue} 
                customerName={booking.profile.fullName} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
