import { log } from "./helpers/log.js";
import FacebookSource from "./sources/facebook.js";
import { checkbox, input } from "@inquirer/prompts";

async function scrape({
	sources,
	facebookCookie,
}: {
	sources: string[],
	facebookCookie?: string,
}): Promise<void> {
	log("Index", "Scraper starting...");
	
	const facebookSource = new FacebookSource(facebookCookie);
	
	const promises = [];
	if(sources.includes("face_book")) promises.push(facebookSource.scrape());

	const results = await Promise.allSettled(promises);

	for(const result of results) {
		if(result.status === "rejected") log("Index", `Error in source: ${result.reason}`);
		else log("Index", "Source finished");
	}
	
	const numRejected = results.filter(result => result.status === "rejected").length;
	const numSucceeded = results.filter(result => result.status === "fulfilled").length;
	log("Index", `Scraper finished with ${numRejected} errors and ${numSucceeded} successes`);
}

async function cli() {
	const sources = await checkbox({
		message: "Choose sources to scrape",
		choices: [
			{ name: "Face Book", value: "face_book" },
		],
	});

	let facebookCookie: string = "";
	if(sources.includes("face_book")) {
		facebookCookie = await input({ message: "Enter Face Book cookie" });
	}
	
	await scrape({ sources, facebookCookie });
}

cli();
