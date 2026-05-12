const path = require("path");
const fs = require("fs");

// Cache the version to avoid reading file multiple times
let cachedVersion = null;
let cachedPackageName = null;

function getVersion() {
  if (!cachedVersion) {
    try {
      const packageJsonPath = path.join(__dirname, "../../package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      cachedVersion = packageJson.version;
      cachedPackageName = packageJson.name;
    } catch (error) {
      console.warn(`⚠️ Could not read package.json: ${error.message}`);
      cachedVersion = "0.0.0";
      cachedPackageName = "repomeld";
    }
  }
  return { version: cachedVersion, name: cachedPackageName };
}

module.exports = { getVersion };