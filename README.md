# repomeld 🔥

> Meld your entire repo into a single file — perfect for AI context, code reviews & sharing.

[![npm version](https://badge.fury.io/js/repomeld.svg)](https://www.npmjs.com/package/repomeld)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

> ## 💼 Open to Work
> **The author is available for freelance & full-time work.**
> 📧 [susheelhbti@gmail.com](mailto:susheelhbti@gmail.com) — reach out anytime!

---

## ✨ Features

- 🚀 **Fast & Efficient** - Async scanning with real-time progress and binary caching
- 🎨 **Multiple Styles** - Banner, Markdown, or Minimal output
- 🔍 **Smart Filtering** - Extension, pattern, and size-based filtering
- 📁 **Gitignore Support** - Respects your .gitignore rules automatically
- 💾 **Binary Detection** - Intelligent caching for binary file detection
- 📦 **Single File Output** - Perfect for AI context windows
- 🔄 **Auto-Numbering** - Never overwrites existing files
- 💿 **Zip Backup** - Creates auto-numbered backups in `repomeld_zips/` folder
- 🔔 **Update Notifications** - Non-intrusive version checking
- 🎯 **Force Include** - Override ignore rules when needed
- 📊 **Dependency Graph** - Optional Mermaid diagram of file dependencies
- 🌍 **Cross-Platform** - Works perfectly on Windows, macOS, and Linux

---

## Install

```bash
npm install -g repomeld
```

Or use without installing:

```bash
npx repomeld
```

---

## Quick Start

```bash
cd your-project
repomeld
```

That's it. repomeld walks your project, respects `.gitignore`, skips binary files, and writes everything into one readable file with optional dependency graphs.

---

## Auto-Numbered Output — No Overwriting

Every time you run repomeld it creates a **new numbered file** so previous runs are never lost:

```
repomeld_output.txt       ← first run
repomeld_output__2.txt    ← second run
repomeld_output__3.txt    ← third run
repomeld_zips/            ← backup folder
  ├── repomeld_output.zip
  ├── repomeld_output__2.zip
  └── repomeld_output__3.zip
```

All previous output files and zips are **automatically excluded** from the next run — so you'll never get repomeld's own output included inside itself.

---

## All Options

```
Usage: repomeld [options]

Options:
  -V, --version                 Show version number
  -h, --help                    Show help

Output:
  -o, --output <filename>       Output file name
                                Default: "repomeld_output.txt"
                                Auto-numbered if the file already exists.

Filtering:
  -e, --ext <exts...>           Only include files with these extensions
                                e.g.  --ext js ts jsx tsx

  --include <patterns...>       Only include files whose path matches a pattern
                                e.g.  --include src/

  --exclude <patterns...>       Skip files whose path matches a pattern
                                e.g.  --exclude test spec __tests__

  -i, --ignore <names...>       Extra folder or file names to ignore
                                e.g.  --ignore dist .next coverage

  --force-include <names...>    Force-include something that would normally be ignored
                                e.g.  --force-include vendor bootstrap

  --max-size <kb>               Skip files larger than N kilobytes
                                Default: 500

  --no-gitignore                Ignore .gitignore file (include everything)

Formatting:
  -s, --style <style>           Header style for each file block:
                                  banner   — clear dividers with file info  (default)
                                  markdown — fenced code blocks, great for AI prompts
                                  minimal  — filename only, no extra formatting

  --no-toc                      Don't include a table of contents at the top

  --no-meta                     Hide per-file metadata (line count, size, language)

  --trim                        Trim leading/trailing whitespace from each file

Advanced:
  --lines-before <n>            Skip the first N lines of every file
  --lines-after <n>             Skip the last N lines of every file
  --dry-run                     Preview which files would be included — nothing is written
  --no-backup                   Skip creating backup zip file
  --no-update-check             Skip checking for updates
```

---

## Examples

```bash
# Basic — include everything, auto-numbered output
repomeld

# Only TypeScript files
repomeld --ext ts tsx

# Only files inside src/
repomeld --include src/

# Skip test files
repomeld --exclude test spec __tests__

# Markdown style — great for pasting into AI chats
repomeld --style markdown --output context.md

# Preview what would be included without writing anything
repomeld --dry-run

# Ignore extra folders on top of defaults
repomeld --ignore coverage logs tmp

# Respect gitignore (default) or ignore it
repomeld --no-gitignore  # include everything

# Only small files — skip anything over 100 KB
repomeld --max-size 100

# Force-include a vendor file that's normally ignored
repomeld --force-include bootstrap

# No table of contents, no metadata
repomeld --no-toc --no-meta

# Combine filters
repomeld --ext php --include Controllers --exclude test --style markdown

# Skip backup creation
repomeld --no-backup
```

---

## Auto-Ignored by Default

repomeld automatically skips these so your output stays clean:

| Category        | What's skipped                                      |
|-----------------|-----------------------------------------------------|
| Dependencies    | `node_modules/`                                     |
| Version control | `.git/`                                             |
| Env / secrets   | `.env`, `.env.local`, `.env.production`             |
| Lock files      | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` |
| Build output    | `dist/`, `build/`, `.next/`, `.nuxt/`, `.cache/`   |
| OS files        | `.DS_Store`                                         |
| repomeld output | `repomeld_output.txt` and all `repomeld_output__N.txt` files |

**Note:** `package.json` and `README.md` are **NOT** ignored by default — they contain important context for AI tools and code reviews.

---

## Custom Ignore Rules

### Method 1: repomeld.ignore.json

Create a `repomeld.ignore.json` in your project root for comprehensive ignore patterns:

```json
{
  "_comment": "repomeld.ignore.json — auto-ignored files and folders",
  "ignore": [
    "coverage",
    "logs",
    "tmp",
    "*.min.js",
    "**/generated/**",
    "vendor/**/bootstrap*",
    "**/jquery*",
    "**/fontawesome*"
  ]
}
```

These are merged with the defaults every time repomeld runs.

### Method 2: .gitignore

repomeld automatically respects your `.gitignore` file. Use `--no-gitignore` to override.

### Method 3: CLI --ignore

Override on the command line:

```bash
repomeld --ignore temp logs "*.tmp"
```

---

## Backup Zip Files

When repomeld runs, it automatically creates a backup zip file in the `repomeld_zips/` folder:

```
repomeld_output.txt
repomeld_zips/
  └── repomeld_output.zip          ← contains all included files + output

repomeld_output__2.txt
repomeld_zips/
  └── repomeld_output__2.zip       ← corresponding backup

repomeld_output__3.txt
repomeld_zips/
  └── repomeld_output__3.zip       ← and so on...
```

The zip file contains:
- All source files included in the run (preserving folder structure)
- The repomeld output file itself

To disable backups: `repomeld --no-backup`

---
 

## Performance Optimizations

repomeld is optimized for large codebases:

- **Async file scanning** - Non-blocking operations
- **Binary caching** - Extension-based detection cache
- **Real-time progress** - Shows ETA and completion percentage
- **Memory efficient** - Processes files in streams
- **Smart filtering** - Early filtering to reduce processing
- **Handles 50,000+ files** - Tested on large monorepos

Example output:
```
🔍 Scanning files...
✅ Found 2453 files in 1.2s

📝 Processing 2453 files...

  Processing: 1245/2453 files (50.7%) | 2.3s elapsed
  Processing: ✅ Completed 2453/2453 files in 4.7s
```

**Memory warning** for extremely large repos (>20,000 files):
```
⚠️ Large repository detected (~25347 files). Memory usage may be high.
```

---

## Use Cases

### 🤖 AI Context Preparation
```bash
repomeld --ext js ts jsx py --style markdown --max-size 200
```

### 📋 Code Review
```bash
repomeld --include src/ --exclude test --style minimal --no-meta
```

### 💾 Full Project Backup
```bash
repomeld --force-include . --max-size 10000 --no-toc --no-meta
```

### 📚 Documentation Generation
```bash
repomeld --ext md --include docs --style markdown --output documentation.md
```

### 🔍 Debug Specific Feature
```bash
repomeld --include feature-name --ext js css --output feature-context.txt
```

### 🗺️ Dependency Analysis
```bash
repomeld --include src --style markdown --output analysis.md
# Then render the Mermaid graph in the output
```

---



## Development

```bash
# Clone the repo
git clone https://github.com/susheelhbti/repomeld.git
cd repomeld

# Install dependencies
npm install

# Run locally
npm start -- --dry-run

# Link for global testing
npm link
repomeld --help

# Run tests
npm test
```

---


---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---



## License

MIT © [Susheel](mailto:susheelhbti@gmail.com)

---

## Support & Contact

- 🐛 **Issues**: [GitHub Issues](https://github.com/susheel/repomeld/issues)
- 📧 **Email**: [susheelhbti@gmail.com](mailto:susheelhbti@gmail.com)
- 💼 **Hire Me**: Available for freelance and full-time opportunities

---

> ## 💼 Hire the Author
> Built by a developer available for **freelance and full-time opportunities**.
> Got a project? Let's talk — 📧 **[susheelhbti@gmail.com](mailto:susheelhbti@gmail.com)**

---
 
 
**Made with ❤️ for developers who need better context for AI tools**
