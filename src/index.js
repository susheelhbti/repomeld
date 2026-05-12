const fs = require("fs").promises;
const path = require("path");
const { isBinaryFile } = require("isbinaryfile");

const { VERSION, BINARY_EXTENSIONS } = require("./utils/constants");
const { formatSize, formatDuration, matchesExtensions, matchesPattern } = require("./utils/helpers");
const { buildIgnoreFilter } = require("./core/ignoreBuilder");
const { getAllFilesWithIgnore } = require("./core/fileScanner");
const { ProgressIndicator } = require("./core/progress");
const { buildHeader, buildFooter, buildTableOfContents, printBanner } = require("./core/formatter");
const { createBackupZip } = require("./utils/backup");
const { resolveOutputPath } = require("./core/pathResolver");
const { checkForUpdates, showUpdateMessage } = require("./updates/updateChecker");

// Cache for binary detection
const binaryCache = new Map();

async function isBinaryFileFast(filePath) {
  // Check cache first
  if (binaryCache.has(filePath)) return binaryCache.get(filePath);
  
  // Quick check by extension
  const ext = path.extname(filePath).slice(1).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) {
    binaryCache.set(filePath, true);
    return true;
  }
  
  // Fall back to full detection
  const result = await isBinaryFile(filePath).catch(() => true);
  binaryCache.set(filePath, result);
  return result;
}

async function repomeld(options) {
  const startTime = Date.now();
  printBanner(VERSION);
  const cwd = process.cwd();

  const { path: outputFile, number: outputNumber } = await resolveOutputPath(path.resolve(cwd, options.output));

  const { ig, forceIg } = await buildIgnoreFilter(options);
  
  // Convert forceIg patterns to array for fileScanner
  const forceIncludePatterns = options.forceInclude || [];
  
  const filterExts = options.ext || [];
  const maxFileSizeBytes = (parseFloat(options.maxSize) || 500) * 1024;
  const headerStyle = options.style || "banner";
  const showMeta = !options.noMeta;
  const showToc = !options.noToc;
  const dryRun = !!options.dryRun;

  console.log(`\n 📂 Source : ${cwd}`);
  console.log(` 📄 Output : ${path.relative(cwd, outputFile)}`);
  console.log(` 🎨 Style  : ${headerStyle}`);
  if (filterExts.length) console.log(` 🔍 Filter : .${filterExts.join(", .")}`);
  if (forceIncludePatterns.length) console.log(` 📌 Force include : ${forceIncludePatterns.join(", ")}`);
  if (dryRun) console.log(` 🧪 Dry run mode`);

  console.log(`\n 🔍 Scanning files...`);
  let allFiles = await getAllFilesWithIgnore(cwd, ig, forceIncludePatterns);

  // Apply filters
  if (filterExts.length) allFiles = allFiles.filter(f => matchesExtensions(f, filterExts));
  if (options.include?.length) allFiles = allFiles.filter(f => matchesPattern(f, options.include));
  if (options.exclude?.length) allFiles = allFiles.filter(f => !matchesPattern(f, options.exclude));

  // Remove previous repomeld outputs - improved pattern
  const outputPattern = new RegExp(`^${path.basename(options.output).replace(/\.txt$/, '')}(_+?\\d+)?\\.txt$`);
  allFiles = allFiles.filter(f => !outputPattern.test(path.basename(f)));

  console.log(` ✅ Found ${allFiles.length} files\n`);

  if (allFiles.length === 0) {
    console.log(" ⚠️ No matching files found.");
    return;
  }

  // Memory warning for large repos
  const estimatedMemoryMB = (allFiles.length * 0.5) / 1024; // Rough estimate: 0.5KB per file path
  if (estimatedMemoryMB > 100) {
    console.log(` ⚠️ Large repository detected (~${allFiles.length} files). Memory usage may be high.\n`);
  }

  let combinedContent = "";
  let skipped = 0, included = 0, totalLines = 0;
  const includedFiles = [];

  const progress = new ProgressIndicator(allFiles.length, ' Processing:');

  for (let i = 0; i < allFiles.length; i++) {
    const filePath = allFiles[i];
    const relativePath = path.relative(cwd, filePath);
    progress.update(i + 1);

    // Use fast binary detection with caching
    if (await isBinaryFileFast(filePath)) {
      skipped++;
      continue;
    }

    const stats = await fs.stat(filePath);
    if (stats.size > maxFileSizeBytes) {
      skipped++;
      continue;
    }

    try {
      let content = await fs.readFile(filePath, "utf8");

      if (options.trim) content = content.trim();

      if (options.linesBefore || options.linesAfter) {
        const lines = content.split("\n");
        const start = Math.max(0, parseInt(options.linesBefore) || 0);
        const end = options.linesAfter 
          ? Math.max(start, lines.length - parseInt(options.linesAfter)) 
          : lines.length;
        content = lines.slice(start, end).join("\n");
      }

      const lineCount = content.split("\n").length;
      totalLines += lineCount;
      includedFiles.push(filePath);

      combinedContent += buildHeader(headerStyle, relativePath, filePath, lineCount, showMeta, stats);
      combinedContent += content;
      combinedContent += buildFooter(headerStyle);

      included++;
    } catch {
      skipped++;
    }
  }

  progress.finish();

  // Final Output
  let finalOutput = `# Generated by repomeld v${VERSION}\n`;
  finalOutput += `# Date   : ${new Date().toISOString()}\n`;
  finalOutput += `# Source : ${cwd}\n`;
  finalOutput += `# Files  : ${included}\n`;
  finalOutput += `# Lines  : ${totalLines}\n\n`;

  if (showToc) finalOutput += buildTableOfContents(includedFiles, cwd);
  finalOutput += combinedContent;

  if (!dryRun) {
    await fs.writeFile(outputFile, finalOutput, "utf8");
  }

  const outputSize = formatSize(Buffer.byteLength(finalOutput, "utf8"));
  const totalTime = Date.now() - startTime;

  console.log(`
  ✨ repomeld complete!
  ─────────────────────────────────────────────────
  ✅ Included : ${included} files
  ⏭ Skipped  : ${skipped} files
  📏 Lines    : ${totalLines}
  💾 Size     : ${outputSize}
  ⏱️  Time     : ${formatDuration(totalTime)}
  📄 Output   : ${path.relative(cwd, outputFile)}${dryRun ? " (dry run)" : ""}
  ─────────────────────────────────────────────────`);

  // Backup ZIP
  if (!dryRun && included > 0 && options.backup !== false) {
    console.log(`\n 📦 Creating backup zip...`);
    try {
      const { zipFilePath, size } = await createBackupZip(includedFiles, cwd, outputFile);
      console.log(` ✅ Backup created: ${path.relative(cwd, zipFilePath)} (${size})`);
    } catch (err) {
      console.log(` ⚠️  Backup failed: ${err.message}`);
    }
  }

  console.log(`\n 💼 Need a developer? susheelhbti@gmail.com`);

  // Update check
  if (!options.noUpdateCheck) {
    const updateInfo = await checkForUpdates();
    if (updateInfo.hasUpdate) {
      showUpdateMessage(VERSION, updateInfo.latestVersion);
    }
  }
  
  // Clear binary cache to free memory
  binaryCache.clear();
}

module.exports = { repomeld };