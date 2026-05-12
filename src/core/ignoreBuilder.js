const fs = require("fs").promises;
const path = require("path");
const ignore = require("ignore");
const { DEFAULT_IGNORE } = require("../utils/constants");

async function loadIgnoreConfig() {
  const configPath = path.resolve(process.cwd(), "repomeld.ignore.json");
  try {
    const data = JSON.parse(await fs.readFile(configPath, "utf8"));
    return Array.isArray(data.ignore) ? data.ignore : [];
  } catch {
    return [];
  }
}

async function buildIgnoreFilter(options) {
  const ig = ignore();
  ig.add(DEFAULT_IGNORE);

  const customIgnores = await loadIgnoreConfig();
  ig.add(customIgnores);

  if (options.ignore?.length) ig.add(options.ignore);

  if (!options.noGitignore) {
    try {
      const gitignorePath = path.join(process.cwd(), ".gitignore");
      const gitignoreContent = await fs.readFile(gitignorePath, "utf8");
      ig.add(gitignoreContent);
    } catch {
      // No .gitignore file, ignore silently
    }
  }

  // Return forceInclude as array for fileScanner
  const forceIncludePatterns = options.forceInclude || [];

  return { ig, forceIncludePatterns };
}

module.exports = { buildIgnoreFilter };