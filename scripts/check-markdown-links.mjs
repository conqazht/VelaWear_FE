#!/usr/bin/env node
// @ts-check

/**
 * Markdown link checker — validates local file and anchor references.
 *
 * Usage: node scripts/check-markdown-links.mjs README.md docs/FILE.md ...
 *
 * - Resolves relative file paths from each document's directory.
 * - Validates explicit anchors against normalised headings.
 * - Ignores http:, https:, and mailto: URLs.
 * - Reports source/line/target for every failure and exits nonzero on error.
 * - Does not rewrite documents or access the network.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

// ---------------------------------------------------------------------------
// Heading normalisation (GitHub-flavoured)
// ---------------------------------------------------------------------------

/**
 * Normalise a heading string to a GitHub-style anchor slug.
 * @param {string} text
 * @returns {string}
 */
function normaliseHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // strip non-word chars except spaces/hyphens
    .replace(/\s+/g, "-"); // spaces → hyphens
}

/**
 * Extract all headings from Markdown content and return a Set of anchors,
 * handling duplicate headings with GitHub-style numeric suffixes.
 * @param {string} content
 * @returns {Set<string>}
 */
function extractAnchors(content) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  /** @type {Set<string>} */
  const anchors = new Set();

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^#{1,6}\s+(.+)/);
    if (!match) continue;

    // Strip inline code, bold, italic, links etc. for heading text
    const raw = match[1]
      .replace(/`[^`]*`/g, (m) => m.slice(1, -1)) // inline code → plain
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](url) → text
      .replace(/[*_~]/g, ""); // bold/italic/strike markers

    const slug = normaliseHeading(raw);
    const prev = counts.get(slug) ?? 0;
    counts.set(slug, prev + 1);

    if (prev === 0) {
      anchors.add(slug);
    } else {
      anchors.add(`${slug}-${prev}`);
    }
  }

  return anchors;
}

// ---------------------------------------------------------------------------
// Link extraction
// ---------------------------------------------------------------------------

/** @typedef {{ line: number; target: string }} LinkRef */

/**
 * Extract Markdown link targets from content.
 * @param {string} content
 * @returns {LinkRef[]}
 */
function extractLinks(content) {
  /** @type {LinkRef[]} */
  const links = [];
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    // Match [text](target) but not ![image](target)
    const re = /(?<!!)\[(?:[^\]]*)\]\(([^)]+)\)/g;
    let m;
    while ((m = re.exec(lines[i])) !== null) {
      links.push({ line: i + 1, target: m[1] });
    }
  }

  return links;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * @param {string} target
 * @returns {boolean}
 */
function isExternal(target) {
  return /^(https?:|mailto:|file:\/\/)/i.test(target);
}

/** @type {Map<string, Set<string>>} */
const anchorCache = new Map();

/**
 * Get anchors for a resolved file path, with caching.
 * @param {string} absPath
 * @returns {Set<string>}
 */
function getAnchorsForFile(absPath) {
  if (anchorCache.has(absPath)) {
    return /** @type {Set<string>} */ (anchorCache.get(absPath));
  }
  const content = readFileSync(absPath, "utf8");
  const anchors = extractAnchors(content);
  anchorCache.set(absPath, anchors);
  return anchors;
}

/** @typedef {{ source: string; line: number; target: string; reason: string }} LinkError */

/**
 * Check all local links in a single Markdown file.
 * @param {string} filePath — path as given on CLI
 * @returns {LinkError[]}
 */
function checkFile(filePath) {
  const absPath = resolve(filePath);

  if (!existsSync(absPath)) {
    return [
      {
        source: filePath,
        line: 0,
        target: filePath,
        reason: "source file not found",
      },
    ];
  }

  const content = readFileSync(absPath, "utf8");
  const links = extractLinks(content);
  /** @type {LinkError[]} */
  const errors = [];

  for (const { line, target } of links) {
    // Skip external
    if (isExternal(target)) continue;

    // Strip query strings for file resolution
    const withoutQuery = target.split("?")[0];

    // Split file path and anchor
    const hashIndex = withoutQuery.indexOf("#");
    const filePart = hashIndex >= 0 ? withoutQuery.slice(0, hashIndex) : withoutQuery;
    const anchorPart = hashIndex >= 0 ? withoutQuery.slice(hashIndex + 1) : null;

    // Decode percent-encoded characters
    const decodedFile = filePart ? decodeURIComponent(filePart) : "";

    if (decodedFile) {
      // Resolve relative to the document's directory
      const targetAbsPath = resolve(dirname(absPath), decodedFile);
      if (!existsSync(targetAbsPath)) {
        errors.push({
          source: filePath,
          line,
          target,
          reason: `file not found: ${decodedFile}`,
        });
        continue;
      }

      // Check anchor if present
      if (anchorPart) {
        const anchors = getAnchorsForFile(targetAbsPath);
        if (!anchors.has(anchorPart)) {
          errors.push({
            source: filePath,
            line,
            target,
            reason: `anchor not found: #${anchorPart}`,
          });
        }
      }
    } else if (anchorPart) {
      // Same-file anchor
      const anchors = getAnchorsForFile(absPath);
      if (!anchors.has(anchorPart)) {
        errors.push({
          source: filePath,
          line,
          target,
          reason: `anchor not found: #${anchorPart}`,
        });
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("Usage: node scripts/check-markdown-links.mjs <file1.md> [file2.md ...]");
  process.exit(2);
}

let totalLinks = 0;
let totalErrors = 0;

for (const file of files) {
  const absPath = resolve(file);
  if (!existsSync(absPath)) {
    console.error(`ERROR: ${file}:0 — source file not found`);
    totalErrors++;
    continue;
  }

  const content = readFileSync(absPath, "utf8");
  const links = extractLinks(content).filter((l) => !isExternal(l.target));
  totalLinks += links.length;

  const errors = checkFile(file);
  for (const err of errors) {
    console.error(`ERROR: ${err.source}:${err.line} → ${err.target} — ${err.reason}`);
  }
  totalErrors += errors.length;
}

console.log(
  `Checked ${files.length} file(s), ${totalLinks} local link(s), ${totalErrors} error(s).`,
);
process.exit(totalErrors > 0 ? 1 : 0);
