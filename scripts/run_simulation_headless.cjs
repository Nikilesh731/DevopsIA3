const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const logs = { console: [], requests: [], responses: [] };
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    logs.console.push({ type: msg.type(), text: msg.text() });
  });

  page.on('request', req => {
    try {
      logs.requests.push({ url: req.url(), method: req.method(), postData: req.postData(), headers: req.headers() });
    } catch (e) {
      logs.requests.push({ url: req.url(), method: req.method() });
    }
  });

  page.on('response', async res => {
    let body = '';
    try {
      body = await res.text();
    } catch (e) {
      body = '<binary or unreadable body>';
    }
    logs.responses.push({ url: res.url(), status: res.status(), body });
  });

  try {
    console.log('Navigating to simulation page...');
    await page.goto('http://localhost:3000/simulation', { waitUntil: 'networkidle' });

    // Wait for region select and choose the first non-empty option
    await page.waitForSelector('select[name="sourceRegion"]', { timeout: 5000 });
    const optionValue = await page.$eval('select[name="sourceRegion"]', sel => {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value) return sel.options[i].value;
      }
      return sel.options[0]?.value || '';
    });

    if (optionValue) {
      console.log('Selecting region', optionValue);
      await page.selectOption('select[name="sourceRegion"]', optionValue);
    }

    // Submit the form (start simulation)
    console.log('Starting simulation (click submit)');
    await page.click('button[type="submit"]');

    // Wait for either completion notice or an error message
    try {
      await page.waitForSelector('text=Simulation completed', { timeout: 60000 });
      console.log('Simulation completed detected in UI');
    } catch (e) {
      console.log('No completion notice within timeout; capturing whatever happened');
    }

  } catch (err) {
    console.error('Headless run error:', err.message);
  } finally {
    const outPath = 'simulation-headless-logs.json';
    await fs.promises.writeFile(outPath, JSON.stringify(logs, null, 2));
    console.log('Wrote logs to', outPath);
    await browser.close();
  }
})();
