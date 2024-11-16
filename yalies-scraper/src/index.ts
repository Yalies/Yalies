import DirectorySource from "./sources/directory.js";
import FacebookSource from "./sources/facebook.js";

interface Person {
  netid?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  college?: string;
  year?: number;
  // Add other potential fields as needed
}

async function scrape(options: {
  peopleSearchSessionCookie?: string;
  csrfToken?: string;
  facebookCookie?: string;
}) {
	console.log("Scraper starting...");
  
	try {
		// Initialize sources with required cookies
		const directorySource = new DirectorySource(
			null, // no cache
			options.peopleSearchSessionCookie || "",
			options.csrfToken || "",
		);
    
		const facebookSource = new FacebookSource(
			null, // no cache
			options.facebookCookie || "",
		);

		// Initialize empty people array to store results
		let people: Person[] = [];
    
		// Start both scrapers concurrently
		console.log("Launching scrapers...");
		await Promise.all([
			// Directory scraper
			/*(async () => {
				try {
					await directorySource.scrape();
					// Integrate directory results
					people = await directorySource.integrate(people);
					console.log("Directory scrape completed");
				} catch (error) {
					console.error("Directory scraper error:", error);
				}
			})(),*/
      
			// Facebook scraper
			(async () => {
				try {
					await facebookSource.scrape();
					// Integrate facebook results
					people = await facebookSource.integrate(people);
					console.log("Facebook scrape completed");
				} catch (error) {
					console.error("Facebook scraper error:", error);
				}
			})(),
		]);

		console.log(`Scraping completed. Total records: ${people.length}`);
		console.log(JSON.stringify(people, null, 2));
		return people;
    
	} catch (error) {
		console.error("Fatal scraper error:", error);
		throw error;
	}
}

// Example usage:
const cookies = {
	peopleSearchSessionCookie: process.env.PEOPLE_SEARCH_SESSION_COOKIE,
	csrfToken: process.env.CSRF_TOKEN,
	facebookCookie: process.env.FACEBOOK_COOKIE,
};

// Run the scraper


scrape(cookies).catch(error => {
	console.error("Scraper failed:", error);
	process.exit(1);
});

export { scrape };
