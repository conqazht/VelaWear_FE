// @ts-check

/**
 * Tests for scripts/check-markdown-links.mjs
 *
 * Run with: node --test scripts/check-markdown-links.test.mjs
 *
 * Creates isolated temporary Markdown fixtures and covers:
 * - Valid relative files
 * - Same-file and cross-file normalised heading anchors
 * - Duplicate headings with GitHub-style numeric suffixes
 * - Percent-encoded paths
 * - Missing file (should fail)
 * - Missing anchor (should fail)
 * - Ignored external URL (should not fail)
 * - Deterministic source/line/target error output
 * - Zero network access
 */

import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CHECKER = join(import.meta.dirname, "check-markdown-links.mjs");

/**
 * Run the checker against files inside a temp directory.
 * @param {string[]} files — file paths relative to cwd
 * @param {string} cwd — working directory
 * @returns {Promise<{ code: number | null; stdout: string; stderr: string }>}
 */
function run(files, cwd) {
  return new Promise((resolve) => {
    execFile("node", [CHECKER, ...files], { cwd }, (error, stdout, stderr) => {
      resolve({
        code: error ? /** @type {number} */ (error.code ?? 1) : 0,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
      });
    });
  });
}

/** @type {string[]} */
const tempDirs = [];

/**
 * Create a fresh temp directory for a test.
 * @returns {string}
 */
function makeTmpDir() {
  const dir = mkdtempSync(join(tmpdir(), "mdlink-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------

describe("check-markdown-links", () => {
  it("passes for valid relative file links", async () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, "target.md"), "# Hello\n");
    writeFileSync(join(dir, "source.md"), "See [target](target.md).\n");

    const result = await run(["source.md"], dir);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /0 error/);
  });

  it("passes for same-file heading anchors", async () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, "doc.md"), "# Getting Started\n\nSee [section](#getting-started).\n");

    const result = await run(["doc.md"], dir);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /0 error/);
  });

  it("passes for cross-file heading anchors", async () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, "api.md"), "# Error Handling\n\nDetails here.\n");
    writeFileSync(join(dir, "readme.md"), "See [errors](api.md#error-handling).\n");

    const result = await run(["readme.md"], dir);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /0 error/);
  });

  it("handles duplicate headings with GitHub-style suffixes", async () => {
    const dir = makeTmpDir();
    writeFileSync(
      join(dir, "dup.md"),
      [
        "# Section",
        "Content one.",
        "# Section",
        "Content two.",
        "# Section",
        "Content three.",
        "",
        "Link to [first](#section), [second](#section-1), [third](#section-2).",
      ].join("\n"),
    );

    const result = await run(["dup.md"], dir);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /0 error/);
  });

  it("handles percent-encoded paths", async () => {
    const dir = makeTmpDir();
    const subDir = join(dir, "my docs");
    mkdirSync(subDir);
    writeFileSync(join(subDir, "guide.md"), "# Setup\n");
    writeFileSync(join(dir, "index.md"), "See [guide](my%20docs/guide.md#setup).\n");

    const result = await run(["index.md"], dir);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /0 error/);
  });

  it("fails for a missing file", async () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, "broken.md"), "See [gone](nonexistent.md).\n");

    const result = await run(["broken.md"], dir);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /broken\.md:1/);
    assert.match(result.stderr, /file not found/);
  });

  it("fails for a missing anchor", async () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, "target.md"), "# Real Heading\n");
    writeFileSync(join(dir, "source.md"), "See [bad anchor](target.md#fake-heading).\n");

    const result = await run(["source.md"], dir);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /source\.md:1/);
    assert.match(result.stderr, /anchor not found/);
  });

  it("ignores external URLs (http, https, mailto)", async () => {
    const dir = makeTmpDir();
    writeFileSync(
      join(dir, "external.md"),
      [
        "Visit [Google](https://google.com).",
        "Read [docs](http://example.com/docs).",
        "Email [us](mailto:hello@example.com).",
      ].join("\n"),
    );

    const result = await run(["external.md"], dir);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /0 local link/);
    assert.match(result.stdout, /0 error/);
  });

  it("produces deterministic error output with source/line/target", async () => {
    const dir = makeTmpDir();
    writeFileSync(
      join(dir, "multi.md"),
      [
        "Good [link](https://example.com).",
        "Bad [file](missing.md).",
        "Also bad [anchor](#no-such-heading).",
      ].join("\n"),
    );

    const result = await run(["multi.md"], dir);
    assert.equal(result.code, 1);

    // Verify deterministic error format
    const errorLines = result.stderr.trim().split("\n");
    assert.equal(errorLines.length, 2);
    assert.match(errorLines[0], /^ERROR: multi\.md:2 → missing\.md — file not found/);
    assert.match(errorLines[1], /^ERROR: multi\.md:3 → #no-such-heading — anchor not found/);
  });
});
