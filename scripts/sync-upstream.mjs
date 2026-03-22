#!/usr/bin/env node

/**
 * sync-upstream.mjs
 *
 * Fetches the latest Zero Trust data from upstream sources and writes it
 * into public/ so the React app can serve it at runtime.
 *
 * Data sources:
 *   - JSON pillar data:  https://zerotrust.microsoft.com/data/{pillar}-pillar-data.json
 *   - SVG icons:         https://zerotrust.microsoft.com/icons/{name}.svg
 *   - Markdown docs:     https://github.com/microsoft/zerotrustassessment  (src/react/docs/)
 *
 * Usage:
 *   node scripts/sync-upstream.mjs
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ── paths ──────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const ICONS_DIR = path.join(PUBLIC, 'icons');
const DOCS_DIR = path.join(PUBLIC, 'docs');
const TMP_DIR = path.join(ROOT, '.sync-tmp');

// ── upstream URLs ──────────────────────────────────────────────────────
const BASE_URL = 'https://zerotrust.microsoft.com';
const PILLAR_DATA_FILES = [
  'identity-pillar-data.json',
  'devices-pillar-data.json',
  'data-pillar-data.json',
  'network-pillar-data.json',
  'infrastructure-pillar-data.json',
  'security-ops-pillar-data.json',
  'ai-pillar-data.json',
];
const DOCS_REPO = 'https://github.com/microsoft/zerotrustassessment.git';
const DOCS_SPARSE_PATH = 'src/react/docs';

// ── helpers ────────────────────────────────────────────────────────────

/** Fetch text with retries */
async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

/** Fetch binary with retries */
async function fetchBuffer(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

/** Write file only if content changed. Returns true if written. */
function writeIfChanged(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath);
    const buf = typeof content === 'string' ? Buffer.from(content) : content;
    if (existing.equals(buf)) return false;
  }
  fs.writeFileSync(filePath, content);
  return true;
}

// ── Step 1: Fetch pillar JSON files ────────────────────────────────────

async function syncJson() {
  console.log('\n=== Syncing pillar JSON data ===');
  let changed = 0;

  const results = await Promise.all(
    PILLAR_DATA_FILES.map(async (file) => {
      const url = `${BASE_URL}/data/${file}`;
      console.log(`  Fetching ${url}`);
      const text = await fetchText(url);
      // Validate it's parseable JSON
      JSON.parse(text);
      const dest = path.join(PUBLIC, file);
      const didChange = writeIfChanged(dest, text);
      return { file, didChange, data: JSON.parse(text) };
    }),
  );

  for (const r of results) {
    if (r.didChange) {
      changed++;
      console.log(`  ✓ Updated ${r.file}`);
    } else {
      console.log(`  · ${r.file} (unchanged)`);
    }
  }

  console.log(`  JSON sync complete: ${changed} file(s) updated`);
  return results;
}

// ── Step 2: Extract icon names and fetch SVGs ──────────────────────────

async function syncIcons(pillarResults) {
  console.log('\n=== Syncing SVG icons ===');

  // Collect all unique icon names from all pillar data
  const iconNames = new Set();
  for (const { data } of pillarResults) {
    for (const fa of data.functionalAreas || []) {
      if (fa.icon) iconNames.add(fa.icon);
    }
    for (const task of data.tasks || []) {
      if (task.icon) iconNames.add(task.icon);
    }
  }

  console.log(`  Found ${iconNames.size} unique icon references`);

  if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

  let changed = 0;
  let failed = 0;

  // Fetch in batches of 20 to avoid overwhelming the server
  const iconList = [...iconNames];
  const BATCH_SIZE = 20;

  for (let i = 0; i < iconList.length; i += BATCH_SIZE) {
    const batch = iconList.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (name) => {
        const url = `${BASE_URL}/icons/${name}`;
        try {
          const buf = await fetchBuffer(url);
          const dest = path.join(ICONS_DIR, name);
          const didChange = writeIfChanged(dest, buf);
          return { name, didChange, ok: true };
        } catch (err) {
          console.warn(`  ✗ Failed to fetch ${name}: ${err.message}`);
          return { name, didChange: false, ok: false };
        }
      }),
    );

    for (const r of results) {
      if (!r.ok) {
        failed++;
      } else if (r.didChange) {
        changed++;
      }
    }
  }

  console.log(
    `  Icon sync complete: ${changed} updated, ${iconNames.size - changed - failed} unchanged, ${failed} failed`,
  );
}

// ── Step 3: Clone docs from GitHub and flatten ─────────────────────────

async function syncDocs() {
  console.log('\n=== Syncing markdown docs ===');

  // Clean up any previous temp directory
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }

  try {
    // Shallow clone with sparse checkout — only fetch src/react/docs/
    console.log('  Cloning microsoft/zerotrustassessment (sparse checkout)...');
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse "${DOCS_REPO}" "${TMP_DIR}"`,
      { stdio: 'pipe' },
    );
    execSync(`git sparse-checkout set "${DOCS_SPARSE_PATH}"`, {
      cwd: TMP_DIR,
      stdio: 'pipe',
    });

    const docsSource = path.join(TMP_DIR, DOCS_SPARSE_PATH);
    if (!fs.existsSync(docsSource)) {
      throw new Error(`Docs path not found after clone: ${docsSource}`);
    }

    // Ensure docs directory exists
    if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

    // Track existing docs to detect removals
    const existingDocs = new Set(
      fs.existsSync(DOCS_DIR)
        ? fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'))
        : [],
    );

    // Walk all .md files recursively and flatten into public/docs/
    let changed = 0;
    let total = 0;
    const newDocs = new Set();

    function walkAndCopy(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkAndCopy(fullPath);
        } else if (entry.name.endsWith('.md')) {
          total++;
          const dest = path.join(DOCS_DIR, entry.name);
          newDocs.add(entry.name);
          const content = fs.readFileSync(fullPath);
          if (writeIfChanged(dest, content)) changed++;
        }
      }
    }

    walkAndCopy(docsSource);

    // Remove docs that no longer exist upstream
    let removed = 0;
    for (const existing of existingDocs) {
      if (!newDocs.has(existing)) {
        fs.unlinkSync(path.join(DOCS_DIR, existing));
        removed++;
        console.log(`  - Removed ${existing}`);
      }
    }

    console.log(
      `  Docs sync complete: ${total} files, ${changed} updated, ${removed} removed`,
    );
  } finally {
    // Clean up temp dir
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log('Zero Trust Explorer — upstream sync');
  console.log(`Working directory: ${ROOT}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const pillarResults = await syncJson();
  await syncIcons(pillarResults);
  await syncDocs();

  console.log('\n=== Sync complete ===\n');
}

main().catch((err) => {
  console.error('\nSync failed:', err);
  process.exit(1);
});
