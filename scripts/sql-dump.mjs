// Builds a database dump that imports into an empty D1 database.
//
// `wrangler d1 export` writes the rows table by table in alphabetical order, so rows of clients,
// news and project_media (which point at projects) come before the projects themselves. D1's remote
// import checks foreign keys statement by statement (PRAGMA defer_foreign_keys does not help there),
// so the import fails. This puts the schema first and then each table's rows after the tables it
// references.

/** Joins a schema-only and a data-only export into one dump in a safe order. */
export function orderedDump(schemaSql, dataSql) {
  const schema = statements(schemaSql);
  const deps = new Map();
  for (const s of schema) {
    const m = s.match(/^CREATE TABLE\s+(?:IF NOT EXISTS\s+)?[`"[]?([\w-]+)/i);
    if (!m) continue;
    const refs = [...s.matchAll(/REFERENCES\s+[`"[]?([\w-]+)/gi)].map((r) => r[1]).filter((t) => t !== m[1]);
    deps.set(m[1], new Set(refs));
  }

  const before = [];
  const rows = new Map();
  for (const s of statements(dataSql)) {
    const m = s.match(/^INSERT\s+INTO\s+[`"[]?([\w-]+)/i);
    if (!m) {
      before.push(s);
      continue;
    }
    if (!rows.has(m[1])) rows.set(m[1], []);
    rows.get(m[1]).push(s);
  }

  const order = [];
  const visit = (table, path = new Set()) => {
    if (order.includes(table) || path.has(table)) return;
    path.add(table);
    for (const dep of deps.get(table) ?? []) if (rows.has(dep)) visit(dep, path);
    order.push(table);
  };
  for (const table of rows.keys()) visit(table);

  const out = [...schema, ...before];
  for (const table of order) out.push(...rows.get(table));
  return out.map((s) => `${s};`).join("\n") + "\n";
}

/** Splits SQL into statements on semicolons outside quotes and comments. */
export function statements(sql) {
  const out = [];
  let current = "";
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      for (; j < sql.length; j++) {
        if (sql[j] === c) {
          if (sql[j + 1] === c) j++; // doubled quote inside the string
          else break;
        }
      }
      current += sql.slice(i, j + 1);
      i = j;
    } else if (c === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
    } else if (c === ";") {
      if (current.trim()) out.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  if (current.trim()) out.push(current.trim());
  return out;
}
