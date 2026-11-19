const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const androidDir = path.join(rootDir, "android");

const crmPath = path.join(rootDir, "src", "actions", "crm.ts");
const crmBak = path.join(rootDir, "src", "actions", "crm.ts.apk.bak");
const pagePath = path.join(rootDir, "src", "app", "page.tsx");
const pageBak = path.join(rootDir, "src", "app", "page.tsx.apk.bak");

try {
  console.log("\n📦 [0/4] Preparing static adapter for Capacitor bundle...");
  // Temporarily backup and bridge actions to static offline crmService for export
  fs.copyFileSync(crmPath, crmBak);
  fs.copyFileSync(pagePath, pageBak);

  fs.writeFileSync(
    crmPath,
    'export * from "@/lib/crmService";\n',
    "utf8"
  );
  fs.writeFileSync(
    pagePath,
    `import AtiqCRMApp from "@/components/AtiqCRMApp";
import { getInitialData } from "@/actions/crm";

export default function Page() {
  const data = getInitialData();
  return <AtiqCRMApp initialData={data} />;
}
`,
    "utf8"
  );

  console.log("\n🚀 [1/4] Building Next.js static export bundle...");
  execSync("pnpm build", {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "apk" },
  });

  console.log("\n📱 [2/4] Syncing Capacitor Android web assets...");
  execSync("pnpm cap sync android", { cwd: rootDir, stdio: "inherit" });

  console.log("\n🔨 [3/4] Compiling Android APK with Gradle...");
  const isWindows = process.platform === "win32";
  const gradlewCmd = isWindows
    ? `"${path.join(androidDir, "gradlew.bat")}" assembleDebug`
    : "./gradlew assembleDebug";
  execSync(gradlewCmd, { cwd: androidDir, stdio: "inherit" });

  console.log("\n📦 [4/4] Finalizing APK output...");
  const sourceApk = path.join(
    androidDir,
    "app",
    "build",
    "outputs",
    "apk",
    "debug",
    "app-debug.apk"
  );
  const targetApk = path.join(rootDir, "atiq-crm-debug.apk");

  if (fs.existsSync(sourceApk)) {
    fs.copyFileSync(sourceApk, targetApk);
    const stats = fs.statSync(targetApk);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\n✅ APK BUILD SUCCESSFUL!`);
    console.log(`📍 Output: ${targetApk}`);
    console.log(`📊 Size: ${sizeMb} MB\n`);
  } else {
    console.error(`\n❌ Error: Output APK not found at ${sourceApk}\n`);
    process.exit(1);
  }
} finally {
  // Always restore original files for live MongoDB connection in web
  console.log("🔄 Restoring live MongoDB actions and dynamic page route...");
  if (fs.existsSync(crmBak)) {
    fs.copyFileSync(crmBak, crmPath);
    fs.unlinkSync(crmBak);
  }
  if (fs.existsSync(pageBak)) {
    fs.copyFileSync(pageBak, pagePath);
    fs.unlinkSync(pageBak);
  }
  console.log("✅ Live MongoDB actions restored.");
}
