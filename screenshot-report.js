const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 800, height: 900 });

  const filePath = path.resolve(__dirname, 'test-report.html');
  await page.goto('file:///' + filePath.replace(/\\/g, '/'));
  await page.waitForTimeout(500);

  await page.screenshot({
    path: 'test-report-screenshot.png',
    fullPage: true
  });

  console.log('스크린샷 저장 완료: test-report-screenshot.png');
  await browser.close();
})();