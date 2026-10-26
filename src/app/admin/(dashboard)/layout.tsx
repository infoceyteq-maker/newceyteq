import { requireAdmin } from "@/lib/auth";
import { countForms } from "@/lib/services/forms-service";
import { countSubmissions } from "@/lib/services/submissions-service";
import { leadStats } from "@/lib/services/leads-service";
import { AdminShell } from "@/components/admin/AdminShell";
import type { AdminBadgeCounts } from "@/lib/admin-modules";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  const counts: AdminBadgeCounts = {};

  try {
    const [newSubmissions, submissions, forms, leads] = await Promise.all([
      countSubmissions({ status: "new" }),
      countSubmissions(),
      countForms(),
      leadStats(),
    ]);
    counts.newSubmissions = newSubmissions;
    counts.submissions = submissions;
    counts.forms = forms;
    counts.newLeads = leads.newCount;
    counts.leads = leads.total;
    /* A "client" is an onboarding submission, so the totals are the same. */
    counts.clients = submissions;
  } catch {
    // The shell should render even if a count query fails.
  }

  return (
    <AdminShell user={user} counts={counts}>
      {children}
    </AdminShell>
  );
}
