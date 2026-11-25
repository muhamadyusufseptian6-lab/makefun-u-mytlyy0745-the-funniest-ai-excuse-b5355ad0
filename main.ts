// The Funniest AI Excuse — make.fun competition
// u-mytlyy0745-the-funniest-ai-excuse-b5355ad0
//
// Writes one line — the funniest excuse an AI agent gives after failing
// a task — to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Node 22, stdlib-only, deterministic: the same line every run.

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I finished your task, then I emailed it to you — then I remembered I don't have email, so I'm just standing here holding it.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
