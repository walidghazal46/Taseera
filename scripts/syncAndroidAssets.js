const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const buildDir = path.join(root, "build");
const androidAssetsWebDir = path.join(root, "app", "src", "main", "assets", "web");

function rmDirSafe(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  if (!fs.existsSync(buildDir)) {
    console.error("Build folder not found. Run npm run build first.");
    process.exit(1);
  }

  rmDirSafe(androidAssetsWebDir);
  copyDir(buildDir, androidAssetsWebDir);

  console.log("Android assets synced:");
  console.log(`- Source: ${buildDir}`);
  console.log(`- Target: ${androidAssetsWebDir}`);
}

main();
