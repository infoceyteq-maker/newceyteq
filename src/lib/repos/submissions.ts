import { newId, one, query } from "@/lib/db";

export type SubmissionRecord = {
  id: string;
  formId: string;
  reference: string;
  data: string;
  status: string;
  notes: string;
  ipHash: string | null;
  userAgent: string | null;
  reviewedById: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const SUBMISSION_COLUMNS = `id, form_id as "formId", reference, data, status, notes,
  ip_hash as "ipHash", user_agent as "userAgent", reviewed_by_id as "reviewedById",
  created_at as "createdAt", updated_at as "updatedAt"`;

export async function createSubmission(input: {
  formId: string;
  reference: string;
  data: Record<string, unknown>;
  ipHash?: string | null;
  userAgent?: string | null;
}) {
  return one<SubmissionRecord>(
    `insert into submissions (id, form_id, reference, data, ip_hash, user_agent)
     values ($1, $2, $3, $4, $5, $6)
     returning ${SUBMISSION_COLUMNS}`,
    [
      newId("sub"),
      input.formId,
      input.reference,
      JSON.stringify(input.data),
      input.ipHash ?? null,
      input.userAgent ?? null,
    ],
  );
}

export async function referenceExists(reference: string) {
  const row = await one<{ id: string }>("select id from submissions where reference = $1", [reference]);
  return !!row;
}

export type SubmissionListRow = SubmissionRecord & {
  formTitle: string;
  formSlug: string;
};

export async function listSubmissions(options: {
  formId?: string;
  status?: string;
  query?: string;
  take?: number;
}): Promise<SubmissionListRow[]> {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (options.formId) {
    params.push(options.formId);
    conditions.push(`s.form_id = $${params.length}`);
  }
  if (options.status && options.status !== "all") {
    params.push(options.status);
    conditions.push(`s.status = $${params.length}`);
  }
  if (options.query) {
    params.push(`%${options.query}%`);
    conditions.push(`(s.reference ilike $${params.length} or s.data ilike $${params.length})`);
  }

  params.push(options.take ?? 200);

  return query<SubmissionListRow>(
    `select s.id, s.form_id as "formId", s.reference, s.data, s.status, s.notes,
            s.ip_hash as "ipHash", s.user_agent as "userAgent", s.reviewed_by_id as "reviewedById",
            s.created_at as "createdAt", s.updated_at as "updatedAt",
            f.title as "formTitle", f.slug as "formSlug"
       from submissions s
       join forms f on f.id = s.form_id
      ${conditions.length ? `where ${conditions.join(" and ")}` : ""}
      order by s.created_at desc
      limit $${params.length}`,
    params,
  );
}

export async function getSubmissionById(id: string) {
  return one<SubmissionRecord>(`select ${SUBMISSION_COLUMNS} from submissions where id = $1 limit 1`, [id]);
}

export async function updateSubmission(
  id: string,
  changes: { status?: string; notes?: string; reviewedById?: string | null },
) {
  return one<SubmissionRecord>(
    `update submissions
        set status = coalesce($2, status),
            notes = coalesce($3, notes),
            reviewed_by_id = coalesce($4, reviewed_by_id),
            updated_at = now()
      where id = $1
      returning ${SUBMISSION_COLUMNS}`,
    [id, changes.status ?? null, changes.notes ?? null, changes.reviewedById ?? null],
  );
}

export async function deleteSubmission(id: string) {
  await query("delete from submissions where id = $1", [id]);
}

export async function countSubmissions(options: { status?: string; since?: Date } = {}) {
  if (options.status) {
    const row = await one<{ count: string }>(
      "select count(*)::int as count from submissions where status = $1",
      [options.status],
    );
    return Number(row?.count ?? 0);
  }
  if (options.since) {
    const row = await one<{ count: string }>(
      "select count(*)::int as count from submissions where created_at >= $1",
      [options.since.toISOString()],
    );
    return Number(row?.count ?? 0);
  }
  const row = await one<{ count: string }>("select count(*)::int as count from submissions");
  return Number(row?.count ?? 0);
}

export async function submissionStatusCounts() {
  const rows = await query<{ status: string; count: number }>(
    "select status, count(*)::int as count from submissions group by status",
  );
  const counts: Record<string, number> = { all: 0, new: 0, reviewed: 0, archived: 0 };
  for (const row of rows) {
    counts[row.status] = Number(row.count);
    counts.all += Number(row.count);
  }
  return counts;
}

/** Created-at timestamps for the last 7 days, used by the dashboard chart. */
export async function recentSubmissionDates() {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);
  const rows = await query<{ createdAt: Date | string }>(
    "select created_at as \"createdAt\" from submissions where created_at >= $1",
    [since.toISOString()],
  );
  return rows.map((row) => new Date(row.createdAt));
}
