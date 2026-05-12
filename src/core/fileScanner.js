const fs = require("fs").promises;
const path = require("path");
const { normalizePath } = require("../utils/constants");

// Pattern to detect repomeld-related files/folders
const REPOMELD_PATTERN = /^repomeld/i; // Case-insensitive, matches anything starting with "repomeld"

async function getAllFilesWithIgnore(dirPath, ig, forceIncludePatterns) {
  const fileList = [];
  const stack = [{ dirPath, relativePath: '.' }];

  // Pre-process force include patterns for faster matching
  const processedPatterns = forceIncludePatterns?.map(pattern => ({
    original: pattern,
    clean: pattern.replace(/^\.\//, '').replace(/\/$/, ''),
    isExact: !pattern.includes('*') && !pattern.includes('/')
  })) || [];

  while (stack.length) {
    const { dirPath: currentDir, relativePath: currentRelative } = stack.pop();
   
    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      continue;
    }
   
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.join(currentRelative, entry.name);
      const normalizedPath = normalizePath(relativePath);
      
      // HARD-CODED: Always ignore any file/folder starting with "repomeld"
      // This prevents recursive inclusion and infinite loops
      // Also ignores repomeld_output.txt, repomeld_zips/, etc.
      if (REPOMELD_PATTERN.test(entry.name)) {
        continue;
      }
     
      // Fast force-include check
      let isForceIncluded = false;
      if (processedPatterns.length) {
        for (const pattern of processedPatterns) {
          if (pattern.isExact) {
            // Exact match - fastest
            if (entry.name === pattern.clean || normalizedPath === pattern.clean) {
              isForceIncluded = true;
              break;
            }
          } else {
            // Pattern matching
            if (normalizedPath.includes(pattern.clean) || 
                normalizedPath.startsWith(pattern.clean + '/') ||
                entry.name.includes(pattern.clean)) {
              isForceIncluded = true;
              break;
            }
          }
        }
      }
      
      // Only check ignore if not force-included
      if (!isForceIncluded && ig.ignores(normalizedPath)) {
        continue;
      }
     
      if (entry.isDirectory()) {
        stack.push({ dirPath: fullPath, relativePath });
      } else if (entry.isFile()) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

module.exports = { getAllFilesWithIgnore };