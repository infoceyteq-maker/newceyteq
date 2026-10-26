/** Prints a quick snapshot of the connected database. `npm run db:stats` */
import { databaseInfo, one, query } from "@/lib/db";

async function main() {
  const info = await databaseInfo();
  console.log(`driver : ${info.driver}${info.host ? ` (${info.host})` : ""}`);
  console.log(`engine : ${info.version?.split(" on ")[0] ?? "unknown"}\n`);

  const forms = await query<{ slug: string; status: string; submissions: number }>(
    `select f.slug, f.status,
            (select count(*)::int from submissions s where s.form_id = f.id) as submissions
       from forms f order by f.updated_at desc`,
  );

  if (forms.length === 0) {
    console.log("No forms yet — run `npm run db:seed`.");
    return;
  }

  for (const form of forms) {
    console.log(`/form/${form.slug.padEnd(34)} ${form.status.padEnd(10)} ${form.submissions} submissions`);
  }

  const totals = await one<{ admins: number; submissions: number }>(
    `select (select count(*)::int from admin_users) as admins,
            (select count(*)::int from submissions) as submissions`,
  );
  console.log(`\n${totals?.admins ?? 0} admin(s), ${totals?.submissions ?? 0} submission(s)`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
