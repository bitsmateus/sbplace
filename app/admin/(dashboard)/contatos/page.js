import Link from "next/link";
import LeadsList from "@/components/admin/LeadsList";
import { LEAD_STATUS, countLeadsByStatus, formatPhone, listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export const metadata = { title: "Contatos — painel SB Place" };

export default async function ContatosPage({ searchParams }) {
  const { status } = await searchParams;
  const filter = LEAD_STATUS.some((s) => s.value === status) ? status : "";
  const leads = listLeads({ status: filter }).map((l) => ({ ...l, phoneDisplay: formatPhone(l.phone) }));
  const counts = countLeadsByStatus();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const tabs = [
    { value: "", label: "Todos", count: total },
    ...LEAD_STATUS.map((s) => ({ ...s, count: counts[s.value] || 0 })),
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Contatos</h1>
      <p className="mt-1 text-sm text-mist">
        Clientes que deixaram nome e WhatsApp no formulário do site. Chame, e marque como “Já chamei”.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {tabs.map((t) => {
          const active = t.value === filter;
          return (
            <Link
              key={t.value || "todos"}
              href={t.value ? `/admin/contatos?status=${t.value}` : "/admin/contatos"}
              className={`rounded-full border px-4 py-2 transition ${
                active ? "border-paper bg-paper text-ink" : "border-line text-mist hover:text-paper"
              }`}
            >
              {t.label} <span className="opacity-60">{t.count}</span>
            </Link>
          );
        })}
      </div>

      <LeadsList leads={leads} />
    </div>
  );
}
