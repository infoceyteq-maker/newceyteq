import { requireAdmin } from "@/lib/auth";
import { countForms } from "@/lib/services/forms-service";
import { countSubmissions } from "@/lib/services/submissions-service";
import { leadStats } from "@/lib/services/leads-service";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  let newCount = 0;
  let formCount = 0;
  let clientCount = 0;
  let newLeadCount = 0;

  try {
    const [newSubmissions, totalSubmissions, forms, leads] = await Promise.all([
      countSubmissions({ status: "new" }),
      countSubmissions(),
      countForms(),
      leadStats(),
    ]);
    newCount = newSubmissions;
    clientCount = totalSubmissions;
    formCount = forms;
    newLeadCount = leads.newCount;
  } catch {
    // Dashboards should still render if a count query fails.
  }

  return (
    <AdminShell
      user={user}
      newCount={newCount}
      formCount={formCount}
      clientCount={clientCount}
      newLeadCount={newLeadCount}
    >
      {children}
    </AdminShell>
  );
}
