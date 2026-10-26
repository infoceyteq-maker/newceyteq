import { newId, one, query } from "@/lib/db";

/** A social-media / email / website enquiry captured by the public lead form. */
export type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  channel: string;
  source: string;
  message: string;
  status: string;
  notes: string;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const LEAD_COLUMNS = `id, name, email, phone, company, channel, source, message, status, notes,
  ip_hash as "ipHash", user_agent as "userAgent", created_at as "createdAt", updated_at as "updatedAt"`;

export async function createLead(input: {
  name: string;
  email: string;
  phone: string;
  company: string;
  channel: string;
  source: string;
  message: string;
  ipHash?: string | null;
  userAgent?: string | null;
}) {
  return one<LeadRecord>(
    `insert into leads (id, name, email, phone, company, channel, source, message, ip_hash, user_agent)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     returning ${LEAD_COLUMNS}`,
    [
      newId("lead"),
      input.name,
      input.email,
      input.phone,
      input.company,
      input.channel,
      input.source,
      input.message,
      input.ipHash ?? null,
      input.userAgent ?? null,
    ],
  );
}

export async function listLeadRecords(options: {
  status?: string;
  channel?: string;
  source?: string;
  query?: string;
  take?: number;
} = {}): Promise<LeadRecord[]> {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (options.status && options.status !== "all") {
    params.push(options.status);
    conditions.push(`status = $${params.length}`);
  }
  if (options.channel && options.channel !== "all") {
    params.push(options.channel);
    conditions.push(`channel = $${params.length}`);
  }
  if (options.source && options.source !== "all") {
    params.push(options.source);
    conditions.push(`source = $${params.length}`);
  }
  if (options.query) {
    params.push(`%${options.query}%`);
    const index = params.length;
    conditions.push(
      `(name ilike $${index} or email ilike $${index} or phone ilike $${index} or company ilike $${index} or message ilike $${index})`,
    );
  }

  params.push(options.take ?? 200);
  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";

  return query<LeadRecord>(
    `select ${LEAD_COLUMNS} from leads ${where} order by created_at desc limit $${params.length}`,
    params,
  );
}

export async function getLeadById(id: string) {
  return one<LeadRecord>(`select ${LEAD_COLUMNS} from leads where id = $1`, [id]);
}

export async function updateLead(
  id: string,
  patch: { status?: string; notes?: string },
) {
  const sets: string[] = [];
  const params: Array<string | number | null> = [];

  if (patch.status !== undefined) {
    params.push(patch.status);
    sets.push(`status = $${params.length}`);
  }
  if (patch.notes !== undefined) {
    params.push(patch.notes);
    sets.push(`notes = $${params.length}`);
  }
  if (sets.length === 0) return getLeadById(id);

  params.push(id);
  return one<LeadRecord>(
    `update leads set ${sets.join(", ")}, updated_at = now()
     where id = $${params.length}
     returning ${LEAD_COLUMNS}`,
    params,
  );
}

export async function deleteLead(id: string) {
  const row = await one<{ id: string }>("delete from leads where id = $1 returning id", [id]);
  return !!row;
}

export async function countLeads(options: { status?: string; source?: string } = {}) {
  const conditions: string[] = [];
  const params: string[] = [];

  if (options.status) {
    params.push(options.status);
    conditions.push(`status = $${params.length}`);
  }
  if (options.source) {
    params.push(options.source);
    conditions.push(`source = $${params.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
  const row = await one<{ count: number | string }>(
    `select count(*)::int as count from leads ${where}`,
    params,
  );
  return Number(row?.count ?? 0);
}

/** Group counts for the dashboard: by status, by channel and by source. */
export async function leadBreakdown() {
  const [byStatus, byChannel, bySource] = await Promise.all([
    query<{ key: string; count: number | string }>(
      "select status as key, count(*)::int as count from leads group by status",
    ),
    query<{ key: string; count: number | string }>(
      "select channel as key, count(*)::int as count from leads group by channel",
    ),
    query<{ key: string; count: number | string }>(
      "select source as key, count(*)::int as count from leads group by source",
    ),
  ]);

  const toMap = (rows: Array<{ key: string; count: number | string }>) =>
    Object.fromEntries(rows.map((row) => [row.key, Number(row.count)]));

  return { byStatus: toMap(byStatus), byChannel: toMap(byChannel), bySource: toMap(bySource) };
}

/** Most recent leads, used by the overview panels. */
export async function recentLeads(take = 5) {
  return query<LeadRecord>(
    `select ${LEAD_COLUMNS} from leads order by created_at desc limit $1`,
    [take],
  );
}
