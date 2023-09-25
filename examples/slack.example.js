import { TickerWatcher, dynamicImport } from '@metex/trading-alerts';
import { WebClient } from '@slack/web-api';
import 'dotenv/config.js';
import puppeteer from 'puppeteer';

const slack = new WebClient(process.env.SLACK_TOKEN);
console.log(`launching browser...`);
const browser = await puppeteer.launch({ headless: 'new' });

const TICKERS = ['AAPL', 'GME', 'MSFT', 'TWTR', 'TSLA', 'AMZN'];

const priceChangeHandler = async ({ ticker, initialPrice, price, delta, threshold }) => {
	console.log('price change!', ticker, initialPrice, price, delta);

	console.log(`[${ticker}]: creating page...`);
	const page = await browser.newPage();
	console.log(`[${ticker}]: getting articles...`);
	const articles = await (
		await dynamicImport('https://raw.githubusercontent.com/elijaholmos/trading-alerts/main/scrapers/bloomberg.js')
	).run({ page, ticker });
	console.log(`[${ticker}]: got articles!`, articles);
	page.close();

	let text = `[${ticker}]: Price change from ${initialPrice} to ${price} exceeds threshold (${threshold * 100}%): ${(
		delta * 100
	).toFixed(2)}%`;

	if (!!articles?.length)
		text += `\n\n*Possibly related articles*
		\r${articles.map(({ title, url }) => `• <${url}|${title}>`).join('\n')}
	`;

	await slack.chat.postMessage({
		channel: '#trading-alerts',
		text,
	});
};

const watchers = TICKERS.map(
	(ticker) =>
		new TickerWatcher({
			ticker,
			threshold: 0.0003,
		})
);
watchers.forEach((watcher) => watcher.on('priceChange', priceChangeHandler));
