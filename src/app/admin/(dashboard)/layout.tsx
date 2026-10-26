import { requireAdmin } from "@/lib/auth";
import { countForms } from "@/lib/services/forms-service";
import { countSubmissions } from "@/lib/services/submissions-service";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  let newCount = 0;
  let formCount = 0;
  try {
    [newCount, formCount] = await Promise.all([
      countSubmissions({ status: "new" }),
      countForms(),
    ]);
  } catch {
    // Dashboards should still render if a count query fails.
  }

  return (
    <AdminShell user={user} newCount={newCount} formCount={formCount}>
      {children}
    </AdminShell>
  );
}
