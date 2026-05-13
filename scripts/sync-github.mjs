/**
 * Degisiklikleri stage + commit + GitHub'a push.
 * Kullanim: npm run sync -- "mesaj"
 * Mesaj yoksa otomatik zaman damgasi kullanilir.
 */
import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit", cwd: process.cwd(), shell: true });
}

const msg =
  process.argv.slice(2).join(" ").trim() ||
  `chore: sync ${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}`;

let porcelain;
try {
  porcelain = execSync("git status --porcelain", { encoding: "utf8" }).trim();
} catch {
  console.error("sync-github: git calismiyor veya repo degil.");
  process.exit(1);
}

if (!porcelain) {
  console.log("sync-github: commit edilecek degisiklik yok.");
  process.exit(0);
}

run("git add -A");
try {
  run(`git commit -m ${JSON.stringify(msg)}`);
} catch {
  console.error("sync-github: commit basarisiz.");
  process.exit(1);
}

try {
  run("git push origin HEAD");
} catch {
  console.error("sync-github: push basarisiz (ag / kimlik dogrulama). Commit yerelde.");
  process.exit(1);
}

console.log("sync-github: GitHub ile senkron.");
