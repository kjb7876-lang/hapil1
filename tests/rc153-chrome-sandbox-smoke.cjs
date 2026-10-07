'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '/tmp/pw155/node_modules',
  'playwright',
));

const outputDir = process.env.HAPIL_QA_OUTPUT || '/tmp/rc153-chrome-sandbox-smoke';
fs.mkdirSync(outputDir, { recursive: true });

const report = {
  status: 'starting',
  commit: require('node:child_process').execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  browserChannel: 'chrome',
  chromiumSandbox: true,
  usedNoSandboxFallback: false,
};

function persist() {
  const serialized = JSON.stringify(report);
  fs.writeFileSync(path.join(outputDir, 'chrome-sandbox-smoke.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log('CHROME_STABLE_SANDBOX_SMOKE', serialized);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n\n\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\`\n`);
  }
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ chromiumSandbox: true, channel: 'chrome', headless: true, args: [] });
    report.browserVersion = browser.version();
    const page = await browser.newPage();
    await page.goto('about:blank');
    report.blankPageOpened = page.url() === 'about:blank';
    if (!report.blankPageOpened) throw new Error(`Unexpected blank-page URL: ${page.url()}`);
    await page.close();
    await browser.close();
    report.status = 'passed';
    persist();
  } catch (error) {
    report.status = 'blocked';
    report.error = {
      name: error?.name || 'Error',
      message: error?.message || String(error),
      stack: error?.stack || '',
    };
    try { await browser?.close(); } catch (closeError) {
      report.closeError = closeError?.stack || String(closeError);
    }
    persist();
    process.exitCode = 1;
  }
})();
