const fs = require("fs").promises;
const path = require("path");

async function resolveOutputPath(desiredPath) {
  try {
    await fs.access(desiredPath);
    const ext = path.extname(desiredPath);
    const base = desiredPath.slice(0, -ext.length);
    let counter = 2;
    while (true) {
      const candidate = `${base}__${counter}${ext}`;
      try {
        await fs.access(candidate);
        counter++;
      } catch {
        return { path: candidate, number: counter };
      }
    }
  } catch {
    return { path: desiredPath, number: null };
  }
}

module.exports = { resolveOutputPath };