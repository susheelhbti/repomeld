const https = require("https");
const { PACKAGE_NAME, VERSION } = require("../utils/constants");

async function checkForUpdates() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'registry.npmjs.org',
      path: `/${PACKAGE_NAME}/latest`,
      method: 'GET',
      timeout: 4000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.version && json.version !== VERSION) {
            resolve({ hasUpdate: true, latestVersion: json.version });
          } else {
            resolve({ hasUpdate: false });
          }
        } catch {
          resolve({ hasUpdate: false });
        }
      });
    });

    req.on('error', () => resolve({ hasUpdate: false }));
    req.on('timeout', () => { req.destroy(); resolve({ hasUpdate: false }); });
    req.end();
  });
}

function showUpdateMessage(currentVersion, latestVersion) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(` ⭐ New version available: ${currentVersion} → ${latestVersion}`);
  console.log(` 📦 Update: npm install -g ${PACKAGE_NAME}@latest`);
  console.log(`${'═'.repeat(60)}\n`);
}

module.exports = { checkForUpdates, showUpdateMessage };