export async function cnbc({ page, ticker }) {
	// Navigate the page to a URL
	await page.goto(`https://www.cnbc.com/quotes/${ticker}?tab=news`);

	// Wait and click on first result
	const latestNews = await page.waitForSelector('.LatestNews-list');
	const res = await latestNews.evaluate((el) => {
		console.log('hello');
		const { href, innerText } = el.children[0].querySelector('a');
		const timeAgo = el.children[0].querySelector('time').innerText;
		return { href, innerText, timeAgo };
	});
	console.log('res', res);

	// // Locate the full title with a unique string
	// const textSelector = await page.waitForSelector('text/Customize and automate');
	// const fullTitle = await textSelector?.evaluate((el) => el.textContent);

	// // Print the full title
	// console.log('The title of this blog post is "%s".', fullTitle);

	return res;
}
