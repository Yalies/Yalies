import FacebookSource from "./sources/facebook.js";

async function scrape({
	facebookCookie,
}: {
	facebookCookie: string,
}): Promise<void> {
	console.log("Scraper starting...");
	
	const facebookSource = new FacebookSource(facebookCookie);
	
	const results = await Promise.allSettled([
		facebookSource.scrape,
	]);

	const numFailed = results.filter(result => result.status === "rejected").length;
	console.log(`Scraper finished with ${numFailed} failed sources`);
}

export { scrape };
