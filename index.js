const path = require('path');
const puppeteer = require('puppeteer');

const viewPort = { width: 1280, height: 600 };
const options = {
  path: 'photostack.png',
  fullPage: true,
  /*
  clip: {
    x: 0,
    y: 0,
    width: 1280,
    height: 600
  }
  */
};

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport(viewPort)
  await page.goto(`${path.join(__dirname, 'index.html')}`, { waitUntil: 'networkidle0'} );
  await page.screenshot(options)
  await browser.close()
})()