const KEYWORDS = ['fed', 'EY'];

/**
 * @param {object} args
 * @param {import('puppeteer').Page} args.page
 * @returns
 */
export async function run({ page, ticker }) {
	// Navigate the page to a URL
	console.log(`[${ticker}]: navigating to page...`);
	await page.goto(`https://www.bnnbloomberg.ca/search/bnn-search-7.337157?q=.`, { timeout: 0 });

	console.log(`[${ticker}]: waiting for search results...`);
	await page.waitForSelector('.search-results');
	const news = (
		await page.$eval(
			'.search-results',
			(parentEl, KEYWORDS) => {
				// recursively search each element for keywords
				const deepSearch = (el, matches = []) => {
					for (const word of KEYWORDS)
						if (
							el?.getAttribute('ng-bind-html')?.contains('result.Name') &&
							el?.innerText?.toLowerCase()?.includes(word.toLowerCase())
						)
							matches.push({
								title: el.innerText,
								url: el.closest('a')?.href,
							});
					// if (!el?.children?.length) {
					// 	for (const word of KEYWORDS)
					// 		if (el?.innerText?.toLowerCase()?.includes(word.toLowerCase())) matches.push(el);
					// 	return matches;
					// }
					if (!el?.children?.length) return matches;
					for (const child of el.children) deepSearch(child, matches);
					return matches;
				};

				return deepSearch(parentEl);
			},
			KEYWORDS
		)
	).reduce((arr, item) => {
		// remove dups
		if (!arr.some(({ url }) => item.url === url)) arr.push(item);
		return arr;
	}, []);

	return news;
}
