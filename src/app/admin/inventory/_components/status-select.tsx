"use client";

import { useTransition } from "react";
import { updateCameraStatus } from "../actions";
import { Loader2 } from "lucide-react";

export function StatusSelect({ cameraId, currentStatus }: { cameraId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const statuses = [
    "AVAILABLE", "BOOKED", "RENTED", "INSPECTION", "MAINTENANCE", "DAMAGED"
  ];

  return (
    <div className="relative inline-block">
      <select 
        disabled={isPending}
        value={currentStatus}
        onChange={(e) => {
          startTransition(() => {
            updateCameraStatus(cameraId, e.target.value);
          });
        }}
        className={`appearance-none outline-none cursor-pointer inline-flex items-center px-3 py-1 pr-6 rounded-full text-xs font-semibold transition-colors
          ${currentStatus === 'AVAILABLE' ? 'bg-accent-success/10 text-accent-success border border-accent-success/20 hover:bg-accent-success/20' : 
            currentStatus === 'MAINTENANCE' ? 'bg-accent-error/10 text-accent-error border border-accent-error/20 hover:bg-accent-error/20' :
            currentStatus === 'RENTED' ? 'bg-accent-info/10 text-accent-info border border-accent-info/20 hover:bg-accent-info/20' :
            'bg-surface-200 text-text-secondary border border-surface-300 hover:bg-surface-300'
          }
        `}
      >
        {statuses.map(s => (
          <option key={s} value={s} className="bg-surface-50 text-text-primary">{s}</option>
        ))}
      </select>
      
      {/* Custom arrow or loader */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin text-current opacity-70" />
        ) : (
          <svg className="w-3 h-3 text-current opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
}
