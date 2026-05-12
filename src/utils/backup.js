const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { formatSize } = require("./helpers");

function resolveZipPath(outputPath) {
  const outputFileName = path.basename(outputPath);
  const outputBaseName = outputFileName.replace(/\.txt$/, '');
  const zipDir = path.join(process.cwd(), "repomeld_zips");

  if (!fs.existsSync(zipDir)) {
    fs.mkdirSync(zipDir, { recursive: true });
  }

  return path.join(zipDir, `${outputBaseName}.zip`);
}

async function createBackupZip(files, cwd, outputFilePath) {
  const zipFilePath = resolveZipPath(outputFilePath);
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve({
        zipFilePath,
        size: formatSize(archive.pointer()),
        fileCount: files.length
      });
    });

    archive.on('error', reject);
    archive.pipe(output);

    for (const filePath of files) {
      const relativePath = path.relative(cwd, filePath);
      archive.file(filePath, { name: relativePath });
    }

    if (fs.existsSync(outputFilePath)) {
      archive.file(outputFilePath, { name: path.basename(outputFilePath) });
    }

    archive.finalize();
  });
}

module.exports = { createBackupZip };