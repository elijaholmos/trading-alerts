import { launch } from 'puppeteer';

const browser = await launch({ headless: 'new' });
const page = await browser.newPage();

// const articles = await (
// 	await dynamicImport('https://raw.githubusercontent.com/elijaholmos/trading-alerts/main/scrapers/bloomberg.js')
// ).run({ page, ticker: 'AAPL' });

const articles = await (await import('./scrapers/bloomberg.js')).run({ page, ticker: 'AAPL' });

console.log('articles', articles);
