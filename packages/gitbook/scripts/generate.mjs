import { execSync } from "child_process";
import { cpSync } from "fs";
import { platform } from "os";

const isWindows = platform() === "win32";

function run(cmd) {
      return execSync(cmd, { shell: true }).toString();
}

if (isWindows) {
  run(`powershell -Command "Copy-Item -Recurse -Force ..\\embed\\standalone\\ .\\public\\~gitbook\\static\\embed"`);
} else {
  run("cp -r ../embed/standalone/ ./public/~gitbook/static/embed");
}

run("bunx gitbook-icons ./public/~gitbook/static/icons custom-icons");
run("bunx gitbook-math ./public/~gitbook/static/math");
run("bunx wrangler types");
