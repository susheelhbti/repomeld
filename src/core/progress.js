const { formatDuration } = require("../utils/helpers");

class ProgressIndicator {
  constructor(total, prefix = '') {
    this.total = total;
    this.prefix = prefix;
    this.current = 0;
    this.startTime = Date.now();
  }

  update(current) {
    this.current = current;
    this.render();
  }

  render() {
    if (this.current % 80 !== 0 && this.current !== this.total) return;
    const percent = (this.current / this.total * 100).toFixed(1);
    const elapsed = Date.now() - this.startTime;
    console.log(`\r${this.prefix} ${this.current}/${this.total} files (${percent}%) | ${formatDuration(elapsed)} elapsed`);
  }

  finish() {
    const elapsed = Date.now() - this.startTime;
    console.log(`\r${this.prefix} ✅ Completed ${this.current}/${this.total} files in ${formatDuration(elapsed)}`);
  }
}

module.exports = { ProgressIndicator };