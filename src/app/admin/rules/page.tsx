import { prisma } from "@/lib/prisma";
import { Settings2 } from "lucide-react";
import { SubmitButton } from "./_components/submit-button";
import { updateBusinessRules } from "./actions";

export const revalidate = 0;

export default async function AdminRulesPage() {
  const rules = await prisma.businessRule.findMany({
    orderBy: { category: 'asc' }
  });

  // Group by category
  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, typeof rules>);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Business Rules</h1>
        <p className="text-text-secondary">Konfigurasi parameter bisnis dan logika sistem.</p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedRules).map(([category, categoryRules]) => (
          <form 
            key={category} 
            action={async (formData) => {
              "use server";
              await updateBusinessRules(category, formData);
            }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-surface-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface-100">
                <Settings2 className="w-5 h-5 text-brand-400" />
              </div>
              <h2 className="text-lg font-bold font-heading">{category}</h2>
            </div>
            
            <div className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {categoryRules.map((rule) => (
                  <div key={rule.id} className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary flex justify-between">
                      <span>{rule.description}</span>
                      <span className="text-xs font-mono text-text-muted bg-surface-100 px-2 py-0.5 rounded">{rule.key}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type={typeof rule.value === 'number' ? 'number' : 'text'}
                        name={`value_${rule.key}`}
                        defaultValue={String(rule.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                      />
                      <div className="flex items-center gap-2 px-3 py-1 bg-surface-100 rounded-lg text-sm text-text-muted">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            name={`active_${rule.key}`}
                            defaultChecked={rule.isActive} 
                            className="rounded text-brand-500" 
                          />
                          Aktif
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <SubmitButton category={category} />
              </div>
            </div>
          </form>
        ))}
        
        {rules.length === 0 && (
          <div className="glass-card p-12 text-center text-text-muted border-dashed border-2 border-surface-200">
            Belum ada Business Rules yang dikonfigurasi. Silakan jalankan seed database.
          </div>
        )}
      </div>
    </div>
  );
}
