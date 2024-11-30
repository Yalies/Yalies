import fs from "fs";

let MAJORS: string[] = [];
let MAJOR_FULL_NAMES: Record<string, string> = {};

function readResources() {
	const majorsText = fs.readFileSync("src/resources/majors.txt", "utf-8");
	MAJORS = majorsText.trim().split("\n");

	const majorFullNamesText = fs.readFileSync("src/resources/major_full_names.json", "utf-8");
	MAJOR_FULL_NAMES = JSON.parse(majorFullNamesText);
}

readResources();

export { MAJORS, MAJOR_FULL_NAMES };
