#!/usr/bin/env node

/**
 * build-book.mjs
 *
 * Generates public/book-data.json — a single JSON file containing all pillar
 * data with pre-rendered HTML from the markdown docs. Used by the BookPage
 * component to render a single-page "Microsoft Zero Trust Book" view.
 *
 * Also downloads the ZT framework image locally for reliable printing.
 *
 * Usage:
 *   node scripts/build-book.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

// ── paths ──────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const DOCS_DIR = path.join(PUBLIC, 'docs');
const IMG_DIR = path.join(PUBLIC, 'img');

// ── pillar config (mirrors src/pillarConfig.ts) ───────────────────────
const PILLARS = [
  { id: 'identity',       name: 'Identity',            dataFile: 'identity-pillar-data.json',       icon: 'application-access.svg',              introDoc: 'IdentityPillar.md' },
  { id: 'devices',        name: 'Devices',             dataFile: 'devices-pillar-data.json',        icon: 'mdm-windows.svg',                     introDoc: 'DevicesPillar.md' },
  { id: 'data',           name: 'Data',                dataFile: 'data-pillar-data.json',           icon: 'know-protect-data.svg',               introDoc: 'DataPillar.md' },
  { id: 'network',        name: 'Network',             dataFile: 'network-pillar-data.json',        icon: 'azure-networking.svg',                introDoc: 'NetworkPillar.md' },
  { id: 'infrastructure', name: 'Infrastructure',      dataFile: 'infrastructure-pillar-data.json', icon: 'app-infrastructure.svg',              introDoc: 'InfrastructurePillar.md' },
  { id: 'security-ops',   name: 'Security Operations', dataFile: 'security-ops-pillar-data.json',   icon: 'microsoft-sentinel.svg',              introDoc: 'SecurityOperationsPillar.md' },
  { id: 'ai',             name: 'AI',                  dataFile: 'ai-pillar-data.json',             icon: 'security-detection-response-ai.svg',  introDoc: 'AIPillar.md' },
];

const FRAMEWORK_IMG_URL = 'https://microsoft.github.io/zerotrustassessment/img/zt-framework.png';
const FRAMEWORK_IMG_LOCAL = 'img/zt-framework.png';

// Minimum doc size to include (skip stubs)
const MIN_DOC_BYTES = 100;

// ── helpers ────────────────────────────────────────────────────────────

/** Strip BOM if present */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Strip Docusaurus YAML frontmatter */
function stripFrontmatter(text) {
  return text.replace(/^---[\s\S]*?---\s*/, '');
}

/** Strip the first markdown heading (e.g. "# Task Name") */
function stripFirstHeading(text) {
  return text.replace(/^#\s+.+\n+/, '');
}

/** Strip iframe tags (not useful for book/print) */
function stripIframes(text) {
  return text.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
}

/** Extract YouTube watch URL from an iframe embed in markdown. Returns null if none found. */
function extractYouTubeUrl(text) {
  const match = text.match(/<iframe[^>]+src="https:\/\/www\.youtube\.com\/embed\/([^?"]+)/i);
  if (!match) return null;
  return `https://www.youtube.com/watch?v=${match[1]}`;
}

/** Extract doc slug from a task link URL */
function docSlugFromLink(link) {
  if (!link) return null;
  try {
    const url = new URL(link);
    const parts = url.pathname.split('/');
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

/** Read a markdown doc, process it, and return HTML. Returns null if missing/stub. */
function readAndRenderDoc(slug) {
  if (!slug) return null;
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  if (raw.length < MIN_DOC_BYTES) return null;

  let md = stripBom(raw);
  md = stripFrontmatter(md);
  md = stripFirstHeading(md);
  md = stripIframes(md);
  md = md.trim();

  if (!md) return null;
  return marked.parse(md);
}

/** Read a pillar intro doc and return { html, youtubeUrl }. Returns null values if missing. */
function readPillarIntro(introDoc) {
  const filePath = path.join(DOCS_DIR, introDoc);
  if (!fs.existsSync(filePath)) return { introHtml: null, youtubeUrl: null };

  const raw = stripBom(fs.readFileSync(filePath, 'utf-8'));

  // Extract YouTube URL before stripping iframes
  const youtubeUrl = extractYouTubeUrl(raw);

  let md = stripFrontmatter(raw);
  md = stripFirstHeading(md);
  md = stripIframes(md);
  md = md.trim();

  const introHtml = md ? marked.parse(md) : null;
  return { introHtml, youtubeUrl };
}

// ── main ───────────────────────────────────────────────────────────────

async function main() {
  console.log('Building book data...');

  // Configure marked for clean output
  marked.setOptions({
    gfm: true,
    breaks: false,
  });

  // Download framework image locally
  console.log('  Downloading ZT framework image...');
  if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
  const imgDest = path.join(PUBLIC, FRAMEWORK_IMG_LOCAL);
  try {
    const res = await fetch(FRAMEWORK_IMG_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(imgDest, buf);
    console.log(`  ✓ Saved ${FRAMEWORK_IMG_LOCAL} (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.warn(`  ✗ Failed to download framework image: ${err.message}`);
    // Non-fatal — page will fall back to external URL
  }

  const chapters = [];
  let totalTasks = 0;
  let totalWithDocs = 0;

  for (const pillar of PILLARS) {
    console.log(`  Processing ${pillar.name}...`);

    // Read pillar JSON
    const jsonPath = path.join(PUBLIC, pillar.dataFile);
    const raw = stripBom(fs.readFileSync(jsonPath, 'utf-8'));
    const data = JSON.parse(raw);

    // Read pillar intro
    const { introHtml, youtubeUrl } = readPillarIntro(pillar.introDoc);

    // Group tasks by functional area, preserving original JSON order
    const sectionMap = new Map();
    for (const fa of data.functionalAreas) {
      sectionMap.set(fa.id, {
        id: fa.id,
        name: fa.name,
        icon: fa.icon || '',
        description: fa.description,
        tasks: [],
      });
    }

    for (const task of data.tasks) {
      if (task.isHidden) continue;

      const slug = docSlugFromLink(task.link);
      const contentHtml = readAndRenderDoc(slug);

      totalTasks++;
      if (contentHtml) totalWithDocs++;

      const section = sectionMap.get(task.functionalAreaId);
      if (section) {
        section.tasks.push({
          id: task.id,
          name: task.name,
          icon: task.icon || '',
          phase: task.phase || '',
          priority: task.priority || '',
          implementationEffort: task.implementationEffort || '',
          userImpact: task.userImpact || '',
          license: task.license || '',
          swimlane: task.swimlane || '',
          link: task.link || '',
          contentHtml: contentHtml,
        });
      }
    }

    // Convert map to array, preserving functionalAreas order
    const sections = data.functionalAreas
      .map((fa) => sectionMap.get(fa.id))
      .filter((s) => s && s.tasks.length > 0);

    chapters.push({
      pillarId: pillar.id,
      pillarName: pillar.name,
      pillarIcon: pillar.icon,
      introHtml,
      youtubeUrl,
      sections,
    });

    const pillarTasks = sections.reduce((sum, s) => sum + s.tasks.length, 0);
    console.log(`    ${sections.length} sections, ${pillarTasks} tasks`);
  }

  const bookData = {
    generatedAt: new Date().toISOString(),
    frameworkImage: FRAMEWORK_IMG_LOCAL,
    chapters,
  };

  const outPath = path.join(PUBLIC, 'book-data.json');
  const json = JSON.stringify(bookData);
  fs.writeFileSync(outPath, json);

  const sizeMB = (Buffer.byteLength(json) / (1024 * 1024)).toFixed(2);
  console.log(`\n  ✓ Wrote book-data.json (${sizeMB} MB)`);
  console.log(`    ${chapters.length} chapters, ${totalTasks} tasks (${totalWithDocs} with docs)`);
  console.log('  Book build complete.\n');
}

main().catch((err) => {
  console.error('Book build failed:', err);
  process.exit(1);
});
