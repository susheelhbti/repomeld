const path = require("path");
const { formatSize, getLanguage } = require("../utils/helpers");
const { LANGUAGE_MAP } = require("../utils/constants");

function buildHeader(style, relativePath, filePath, lineCount, showMeta, stats) {
  const lang = getLanguage(filePath, LANGUAGE_MAP);
  const meta = showMeta ? ` [${lineCount} lines | ${formatSize(stats.size)}${lang ? ` | ${lang}` : ""}]` : "";

  if (style === "markdown") {
    return `\n## 📄 ${relativePath}${meta}\n\n\`\`\`${lang}\n`;
  }
  if (style === "minimal") {
    return `\n# ${relativePath}\n`;
  }

  const divider = "─".repeat(60);
  return `\n${divider}\n FILE: ${relativePath}${meta}\n${divider}\n\n`;
}

function buildFooter(style) {
  return style === "markdown" ? "\n```\n" : "\n";
}

function buildTableOfContents(files, cwd) {
  let toc = "TABLE OF CONTENTS\n" + "═".repeat(60) + "\n";
  files.forEach((f, i) => {
    let rel = path.relative(cwd, f);
    // Normalize to forward slashes for cross-platform consistency
    rel = rel.split(path.sep).join('/');
    toc += ` ${String(i + 1).padStart(3, " ")}. ${rel}\n`;
  });
  toc += "═".repeat(60) + "\n\n";
  return toc;
}

function printBanner(VERSION) {
  console.log(`
╔══════════════════════════════════════════════════════╗
║ repomeld v${VERSION}                                 ║
║ Meld your repo into one file 🔥                       ║
╠══════════════════════════════════════════════════════╣
║ 💼 susheelhbti@gmail.com — Open for work             ║
╚══════════════════════════════════════════════════════╝`);
}

module.exports = {
  buildHeader,
  buildFooter,
  buildTableOfContents,
  printBanner,
};