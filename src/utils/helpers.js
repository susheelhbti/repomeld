const path = require("path");

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDuration(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function matchesExtensions(filePath, exts) {
  if (!exts?.length) return true;
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return exts.map(e => e.replace(/^\./, "").toLowerCase()).includes(ext);
}

function matchesPattern(filePath, patterns) {
  if (!patterns?.length) return false;
  const rel = path.relative(process.cwd(), filePath);
  return patterns.some(p => rel.includes(p) || path.basename(filePath).includes(p));
}

function getLanguage(filePath, LANGUAGE_MAP) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return LANGUAGE_MAP[ext] || "";
}

module.exports = {
  formatSize,
  formatDuration,
  matchesExtensions,
  matchesPattern,
  getLanguage,
};