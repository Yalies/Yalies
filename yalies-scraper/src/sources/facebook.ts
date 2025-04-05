import Source from "./source.js";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { log, logError } from "../helpers/log.js";
import { Person } from "../../../yalies-shared/datatypes.js";
import { MAJOR_FULL_NAMES, MAJORS } from "../helpers/majors.js";
import { getTextContentNonRecursive } from "../helpers/jsdomUtil.js";


const BIRTHDAY_REGEX = /^[A-Z][a-z]{2} \d{1,2}$/;
const ACCESS_CODE_REGEX = /^[0-9]-[0-9]+$/;
const PHONE_REGEX = /[0-9]{3}-[0-9]{3}-[0-9]{4}/;
const PHONE_COUNTRY_CODE_REGEX = /\+1? /;
const PHONE_DISALLOWED_CHARACTERS_REGEX = /[A-Za-z\(\) \-\.]/;
const MONTH_ABBREVIATIONS = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type Birthday = {
	month: number;
	day: number;
}

export default class FacebookSource extends Source {
	#cookie: string;

	constructor(cookie: string) {
		super();
		this.#cookie = cookie;
	}

	getRoomNumbers = async (): Promise<Person[]> => {
		// First, set the room to search
		// Equivalent to changing the dropdown from a browser
		let response;
		const roomHtmlStrings: Person[] = [];
		try {
			response = await fetch("https://students.yale.edu/facebook/Sort?sort=roomnumber", {
				method: "GET",
				headers: {
					"Cookie": this.#cookie,
				},
			});
			if (response) {
				let roomNumbers: { value: string; label: string }[];
				const text = await response.text();
				const dom = new JSDOM(text);
				const doc = dom.window.document;
				const dropdown = doc.getElementById("items_search");
				if (dropdown) {
					const options = dropdown.querySelectorAll("option");
					roomNumbers = Array.from(options).map(option => ({
						value: option.value,
						label: option.textContent?.trim() || "",
					}));
					// return roomNumbers;
				}
				// Declare roomNumbers before using it
				// Iterate through number in roomNumbers
				for (let i = 1; i < roomNumbers.length; i++) {
					const roomNumber = roomNumbers[i].value;
					let response2;
					try {
						response2 = await fetch(`https://students.yale.edu/facebook/PhotoPageNew?currentIndex=${roomNumber}&currentSortValue=${roomNumber}`, {
							method: "GET",
							headers: {
								"Cookie": this.#cookie,
							},
						});
						if (response2) {
							console.log(`Fetched room number ${roomNumber}`);
							// Process response2 if needed
							const text2 = await response2.text();
							//print to out.txt
							//const filePath = "out.txt";
							//fs.appendFileSync(filePath, text2);
							if(text2){
								const dom2 = new JSDOM(text2);
								const doc2 = dom2.window.document;
    
								const containers = doc2.querySelectorAll(".student_container");
								
								const people = Array.from(containers).map(container => this.parseStudentContainer(container));
								people.forEach(person => {
									roomHtmlStrings.push({ ...person, room_label: roomNumbers[i].label });
								});
							}
							
							// wait for user input
							
						}
					} catch (e) {
						logError("FacebookSource", "Failed to fetch room number details", e);
						throw e;
					}
				}
			}
		} 
		catch(e) {
			logError("FacebookSource", "Failed to set room dropdown", e);
			throw e;
		}
		return roomHtmlStrings;

		
	};


	getHtml = async (): Promise<string> => {
		// First, set the college to search
		// Equivalent to changing the dropdown from a browser
		try {
			await fetch("https://students.yale.edu/facebook/ChangeCollege?newOrg=Yale%20College", {
				method: "GET",
				headers: {
					"Cookie": this.#cookie,
				},
			});
		} catch(e) {
			logError("FacebookSource", "Failed to set college dropdown", e);
			throw e;
		}

		// Next, send the request to get the data
		let response;
		try {
			response = await fetch("https://students.yale.edu/facebook/PhotoPageNew?currentIndex=-1&numberToGet=-1", {
				method: "GET",
				headers: {
					"Cookie": this.#cookie,
				},
			});
		} catch(e) {
			logError("FacebookSource", "Failed to get data", e);
			throw e;
		}
		
		let text;
		try {
			text = await response.text();
		} catch(e) {
			logError("FacebookSource", "Failed to read response text", e);
			throw e;
		}
		return text;
	};

	parseBirthday = (birthday: string): Birthday | null => {
		if (!BIRTHDAY_REGEX.test(birthday)) return null;

		const [month, day] = birthday.split(" ");
		return {
			month: MONTH_ABBREVIATIONS.indexOf(month),
			day: parseInt(day, 10),
		};
	};

	parseStudentContainer = (container: Element): Person => {
		const person: Person = {
			school: "Yale College",
			school_code: "YC",
			first_name: "",
			room_label: "",
			last_name: "",
			year: null,
			pronouns: null,
			college: "",
			visitor: false,
			address: "",
			major: "",
			leave: false,
		};

		// Parse name
		const nameElement = container.querySelector("h5.yalehead");
		if (nameElement?.textContent) {
			// Name Coach play button is a child of the name element, so we need
			// to use this helper function to get only the text content
			const split = getTextContentNonRecursive(nameElement).split(", ");
			if(split.length >= 2) {
				person.last_name = split[0].trim();
				person.first_name = split[1].trim();
			}
		}

		// Parse year
		const yearElement = container.querySelector(".student_year");
		if (yearElement?.textContent) {
			const yearText = yearElement.textContent.replace("'", "");
			if(yearText) person.year = 2000 + parseInt(yearText, 10);
		}

		// Parse pronouns
		const pronounsElement = container.querySelector(".student_info_pronoun");
		if (pronounsElement?.textContent) {
			person.pronouns = pronounsElement.textContent
				.replace("(", "")
				.replace(")", "")
				.trim() || null;
		}

		// Parse college and other info
		const infoElements = container.querySelectorAll(".student_info");
		if (infoElements.length > 0) {
			// College
			person.college = infoElements[0].textContent?.replace(" College", "") ?? "";

			// Email and other info
			if (infoElements.length > 1) {
				const emailElement = infoElements[1].querySelector("a");
				if (emailElement?.textContent) person.email = emailElement.textContent;

				// Process additional information
				const trivia = Array.from(infoElements[1].childNodes)
					.filter(node => node.nodeType === 3) // Text nodes only
					.map(node => node.textContent?.trim());

				this.processTrivia(person, trivia);
			}
		}

		return person;
	};

	private cleanPhone = (phone: string): string => {
		phone = phone.replace(PHONE_COUNTRY_CODE_REGEX, "");
		phone = phone.replace(PHONE_DISALLOWED_CHARACTERS_REGEX, "");
		if (phone === "1111111111") return null;
		return phone;
	};

	private processTrivia = (person: Person, trivia: string[]): void => {
		// Process birthday if present
		if (trivia.length > 0 && BIRTHDAY_REGEX.test(trivia[trivia.length - 1])) {
			const birthday = trivia.pop();
			const birthdayInfo = this.parseBirthday(birthday);
			if (birthdayInfo) {
				person.birth_month = birthdayInfo.month;
				person.birth_day = birthdayInfo.day;
			}
		}

		// Process major if present
		if (trivia.length > 0 && MAJORS.includes(trivia[trivia.length - 1])) {
			const major = trivia.pop();
			person.major = major in MAJOR_FULL_NAMES ? MAJOR_FULL_NAMES[major] : major;
			person.visitor = major === "Visiting International Program";
		}

		// Process remaining trivia
		const remainingTrivia: string[] = [];
		for (const item of trivia) {
			const trimmed = item.replace(/ \/$/, "");
			if (ACCESS_CODE_REGEX.test(trimmed)) {
				person.access_code = trimmed;
				continue;
			}
			if (PHONE_REGEX.test(trimmed)) {
				person.phone = this.cleanPhone(trimmed);
				continue;
			}

			remainingTrivia.push(item);
		}

		person.address = remainingTrivia.join("\n");
	};

	scrape = async () => {
		const numbers = await this.getRoomNumbers();
		// print all elements of numbers
		numbers.forEach(element => console.log(element));
		// wait for 100 seconds
		await new Promise(resolve => setTimeout(resolve, 100000));
		log("FacebookSource", "Room numbers fetched");



		const html = await this.getHtml();
		log("FacebookSource", "HTML fetched");
		const dom = new JSDOM(html);
		const document = dom.window.document;
    
		const containers = document.querySelectorAll(".student_container");
    
		if (containers.length === 0) {
			logError("FacebookSource", "No student containers found", null);
			throw new Error("No student containers found");
		}

		const people = Array.from(containers).map(this.parseStudentContainer);
		log("FacebookSource", `Scraped ${people.length} records`);

		console.log(JSON.stringify(people, null, 2));
	};
}
