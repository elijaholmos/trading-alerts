import { WebClient } from '@slack/web-api';
import 'dotenv/config.js';
import { launch } from 'puppeteer';
import { TickerWatcher } from './TickerWatcher.js';

const slack = new WebClient(process.env.SLACK_TOKEN);

const TICKERS = ['AAPL'];

const priceChangeHandler = async ({ ticker, initialPrice, price, delta, threshold }) => {
	console.log('price change!', ticker, initialPrice, price, delta);

	const browser = await launch({ headless: 'new' });
	const page = await browser.newPage();
	const articles = await (await import('./scrapers/bloomberg.js')).run({ page, ticker });

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

const watchers = TICKERS.map((ticker) => new TickerWatcher({ ticker, threshold: 0.0003 }));
watchers.forEach((watcher) => watcher.on('priceChange', priceChangeHandler));
