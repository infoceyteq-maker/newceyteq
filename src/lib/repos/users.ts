import { newId, one, query } from "@/lib/db";

export type AdminUserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  lastLoginAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export async function findUserByEmail(email: string) {
  return one<AdminUserRecord>(
    `select id, email, name, password_hash as "passwordHash", role,
            last_login_at as "lastLoginAt", created_at as "createdAt", updated_at as "updatedAt"
       from admin_users
      where lower(email) = lower($1)
      limit 1`,
    [email],
  );
}

export async function findUserById(id: string) {
  return one<AdminUserRecord>(
    `select id, email, name, password_hash as "passwordHash", role,
            last_login_at as "lastLoginAt", created_at as "createdAt", updated_at as "updatedAt"
       from admin_users
      where id = $1
      limit 1`,
    [id],
  );
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role?: string;
}) {
  return one<AdminUserRecord>(
    `insert into admin_users (id, email, name, password_hash, role)
     values ($1, lower($2), $3, $4, $5)
     returning id, email, name, password_hash as "passwordHash", role, last_login_at as "lastLoginAt"`,
    [newId("usr"), input.email, input.name, input.passwordHash, input.role ?? "admin"],
  );
}

export async function countUsers() {
  const row = await one<{ count: string }>("select count(*)::int as count from admin_users");
  return Number(row?.count ?? 0);
}

export async function touchLastLogin(id: string) {
  await query("update admin_users set last_login_at = now(), updated_at = now() where id = $1", [id]);
}
