// One-shot script run by the `storage-seed` compose service.
//
// data-seed only copies database ROWS from the cloud project — the
// image_url/card_url/logo_url columns it imports still point at the cloud
// project's storage. This script finds every such URL, downloads the file
// (public, no auth needed) and re-uploads it into this instance's own
// Storage, then rewrites the row to point locally. Safe to re-run: any row
// already pointing at SUPABASE_PUBLIC_URL is left alone.

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://envoy:8000";
const SUPABASE_PUBLIC_URL = process.env.SUPABASE_PUBLIC_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SUPABASE_PUBLIC_URL || !SERVICE_ROLE_KEY) {
  console.error("SUPABASE_PUBLIC_URL and SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

// (table, [columns]) pairs known to hold public storage URLs.
const TARGETS = [
  ["gallery_images", ["image_url"]],
  ["kwatt_heroes", ["image_url"]],
  ["miss_candidates", ["image_url"]],
  ["miss_gallery_images", ["image_url"]],
  ["miss_registrations", ["image_url", "card_url", "auth_url"]],
  ["partners", ["logo_url"]],
  ["program_events", ["image_url"]],
];

const STORAGE_URL_RE = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;

const authHeaders = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
};

async function restGet(table, columns) {
  const res = await fetch(`${INTERNAL_API_URL}/rest/v1/${table}?select=id,${columns.join(",")}`, {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`GET ${table} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function restPatch(table, id, patch) {
  const res = await fetch(`${INTERNAL_API_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`PATCH ${table}/${id} failed: ${res.status} ${await res.text()}`);
}

async function storageUpload(bucket, path, buffer, contentType) {
  const res = await fetch(`${INTERNAL_API_URL}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": contentType, "x-upsert": "true" },
    body: buffer,
  });
  if (!res.ok) throw new Error(`upload ${bucket}/${path} failed: ${res.status} ${await res.text()}`);
}

let migrated = 0;
let skipped = 0;
let failed = 0;

for (const [table, columns] of TARGETS) {
  let rows;
  try {
    rows = await restGet(table, columns);
  } catch (err) {
    console.warn(`==> Skipping table "${table}" (not reachable): ${err.message}`);
    continue;
  }

  for (const row of rows) {
    for (const column of columns) {
      const url = row[column];
      if (!url || typeof url !== "string") continue;
      if (url.startsWith(SUPABASE_PUBLIC_URL)) {
        skipped++;
        continue;
      }
      const match = url.match(STORAGE_URL_RE);
      if (!match) continue; // not a storage URL (external image, etc.) — leave as-is

      const [, bucket, path] = match;
      try {
        const download = await fetch(url);
        if (!download.ok) throw new Error(`download failed: ${download.status}`);
        const contentType = download.headers.get("content-type") || "application/octet-stream";
        const buffer = Buffer.from(await download.arrayBuffer());

        await storageUpload(bucket, path, buffer, contentType);

        const localUrl = `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${bucket}/${path}`;
        await restPatch(table, row.id, { [column]: localUrl });

        migrated++;
        console.log(`==> ${table}.${column} (${row.id}): ${bucket}/${path}`);
      } catch (err) {
        failed++;
        console.error(`!!  ${table}.${column} (${row.id}) — ${err.message}`);
      }
    }
  }
}

console.log(`Storage seed done: ${migrated} file(s) migrated, ${skipped} already local, ${failed} failed.`);
process.exit(0);
