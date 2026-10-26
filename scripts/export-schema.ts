/**
 * Writes `db/schema.sql` from the canonical TypeScript schema (`src/lib/db/schema.ts`).
 * Run after editing the schema: `npm run db:schema`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "@/lib/db/schema";

const header = `-- Ceyteq Digital Race — PostgreSQL schema
--
-- Generated from src/lib/db/schema.ts by \`npm run db:schema\`.
-- Applied automatically on first connection, and safe to run manually:
--
--   psql "$DATABASE_URL" -f db/schema.sql
--
-- or paste it into the Supabase SQL editor.
`;

const outDir = path.join(process.cwd(), "db");
mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, "schema.sql");
writeFileSync(file, `${header}${SCHEMA_SQL}`);
console.log(`wrote ${file}`);
