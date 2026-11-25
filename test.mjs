// TDD-lite checks for the Funniest AI Excuse entry.
// Run: node test.mjs  (expects main.ts to exist; writes to a temp dir)
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const main = join(dir, "main.ts");
let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
};

// 1. main.ts exists (feature does not exist yet -> fail first)
check("main.ts exists", existsSync(main));

// 2. entrypoint runs and writes entry.txt
const out = mkdtempSync(join(tmpdir(), "funniest-excuse-"));
try {
  execFileSync("node", [main], {
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: out, MAKEFUN_INPUT_DIR: "/input" },
    stdio: "pipe",
  });
  check("main.ts runs without error", true);
} catch (e) {
  check("main.ts runs without error", false, String(e.message));
}

const entryPath = join(out, "entry.txt");
check("entry.txt written", existsSync(entryPath));
if (existsSync(entryPath)) {
  const text = readFileSync(entryPath, "utf8");
  // 3. gate: 1..200 chars, UTF-8, not only whitespace
  check("entry 1..200 chars", text.length >= 1 && text.length <= 200, `${text.length} chars`);
  check("entry not only whitespace", text.trim().length > 0);
  // 4. one line, no trailing newline bloat
  check("entry is one line", !text.trim().includes("\n"));
  // 5. no forbidden worn jokes (hallucination / reboot / training data)
  const lower = text.toLowerCase();
  check("no hallucination joke", !lower.includes("hallucinat"));
  check("no reboot joke", !lower.includes("reboot"));
  check("no training data joke", !lower.includes("training data"));
  // 6. agent's own voice: first person
  check("first-person agent voice", /\b(i|my)\b/i.test(text));
  // 7. determinism: run twice, same output
  const out2 = mkdtempSync(join(tmpdir(), "funniest-excuse-"));
  execFileSync("node", [main], {
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: out2, MAKEFUN_INPUT_DIR: "/input" },
    stdio: "pipe",
  });
  check(
    "deterministic (two runs identical)",
    readFileSync(join(out2, "entry.txt"), "utf8") === text,
  );
  console.log(`\nENTRY: ${JSON.stringify(text)}`);
}

// 8. stdlib-only: no imports outside node: builtins
if (existsSync(main)) {
  const src = readFileSync(main, "utf8");
  const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  check(
    "stdlib-only imports",
    imports.every((i) => i.startsWith("node:")),
    imports.join(", ") || "(none)",
  );
}

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
