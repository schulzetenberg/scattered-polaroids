const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const artistData = require('./example');
const { width, height } = require('./config');

const options = {
  path: 'scattered-polaroids.png',
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

const templatePage = fs.readFileSync(`${path.join(__dirname, 'main.ejs')}`, 'utf8');
const stylesCss = fs.readFileSync(`${path.join(__dirname, 'css/styles.css')}`, 'utf8');
const normalizeCss = fs.readFileSync('node_modules/normalize.css/normalize.css', 'utf8');
const scatteredPolaroids = fs.readFileSync(`${path.join(__dirname, 'js/scattered-polaroids.js')}`, 'utf8');

const templateData = {
  stylesCss,
  normalizeCss,
  scatteredPolaroids,
  artistData
};

if(artistData.length === 0) {
  return console.error('No artist data!');
}

const renderedPage = ejs.render(templatePage, templateData, {});

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  console.log(renderedPage);
  await page.setContent(renderedPage, { waitUntil: 'networkidle0'} );
  await page.screenshot(options);
  await browser.close();
})()