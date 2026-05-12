#!/usr/bin/env node

const { program } = require("commander");
const { repomeld } = require("../src/index");
const { VERSION } = require("../src/utils/constants");

program
  .name("repomeld")
  .description("Meld your entire repo into a single file — perfect for AI context & code reviews")
  .version(VERSION)
  .option("-o, --output <filename>", "Output filename", "repomeld_output.txt")
  .option("-e, --ext <exts...>", "Only include specific extensions")
  .option("--include <patterns...>", "Force include files matching patterns")
  .option("--exclude <patterns...>", "Exclude files matching patterns")
  .option("-i, --ignore <names...>", "Additional ignore patterns")
  .option("--force-include <names...>", "Force include even if ignored")
  .option("--max-size <kb>", "Maximum file size in KB", "500")
  .option("--no-gitignore", "Don't respect .gitignore")
  .option("-s, --style <style>", "Header style: banner | markdown | minimal", "banner")
  .option("--no-toc", "Disable table of contents")
  .option("--no-meta", "Hide file metadata")
  .option("--trim", "Trim whitespace from each file")
  .option("--lines-before <n>", "Skip first N lines", parseInt)
  .option("--lines-after <n>", "Skip last N lines", parseInt)
  .option("--dry-run", "Preview without writing files")
  .option("--no-backup", "Skip backup zip creation")
  .option("--no-update-check", "Skip update check")
  .action(async (options) => {
    try {
      await repomeld(options);
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      if (process.env.DEBUG) console.error(error);
      process.exit(1);
    }
  });

program.parse(process.argv);