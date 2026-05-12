const path = require("path");
const { getVersion } = require("./version");

// Normalize paths for cross-platform compatibility
const normalizePath = (p) => p.split(path.sep).join('/');

// Auto-read version from package.json
const { version: VERSION, name: PACKAGE_NAME } = getVersion();

const DEFAULT_IGNORE = [
  "node_modules", ".git", ".env", ".env.local", ".env.production",
  ".DS_Store", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  ".next", ".nuxt", "dist", "build", ".cache"
];

const LANGUAGE_MAP = {
  js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
  py: "python", rb: "ruby", java: "java", cpp: "cpp", c: "c",
  cs: "csharp", go: "go", rs: "rust", php: "php", swift: "swift",
  kt: "kotlin", html: "html", css: "css", scss: "scss", json: "json",
  yaml: "yaml", yml: "yaml", md: "markdown", sh: "bash", bash: "bash",
  toml: "toml", xml: "xml", sql: "sql", graphql: "graphql",
};

// Binary extensions cache for performance
const BINARY_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
  'pdf', 'zip', 'tar', 'gz', '7z', 'rar',
  'mp3', 'mp4', 'avi', 'mov', 'wav',
  'exe', 'dll', 'so', 'dylib',
  'woff', 'woff2', 'ttf', 'eot', 'otf'
]);

module.exports = {
  normalizePath,
  VERSION,
  PACKAGE_NAME,
  DEFAULT_IGNORE,
  LANGUAGE_MAP,
  BINARY_EXTENSIONS,
};