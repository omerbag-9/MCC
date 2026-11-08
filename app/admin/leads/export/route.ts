import { desc, eq } from "drizzle-orm";
import { getAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { LEAD_STATUSES, leads, type LeadStatus } from "@/lib/db/schema";

function csvCell(value: unknown) {
  let s = value == null ? "" : String(value);
  // Prevent formula injection when the CSV is opened in Excel / Sheets.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const statusParam = new URL(request.url).searchParams.get("status");
  const status = LEAD_STATUSES.includes(statusParam as LeadStatus) ? (statusParam as LeadStatus) : null;

  const db = await getDb();
  const rows = await db.query.leads.findMany({
    where: status ? eq(leads.status, status) : undefined,
    orderBy: [desc(leads.createdAt)],
  });

  const header = ["id", "created_at", "status", "name", "phone", "email", "service", "message", "page", "notes"];
  const lines = rows.map((l) =>
    [l.id, l.createdAt.toISOString(), l.status, l.name, l.phone, l.email, l.serviceInterest, l.message, l.pageSource, l.notes]
      .map(csvCell)
      .join(","),
  );
  const csv = "﻿" + [header.join(","), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
