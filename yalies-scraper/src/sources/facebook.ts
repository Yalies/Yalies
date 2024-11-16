import Source from "./source.js";
import axios from "axios";
import { JSDOM } from "jsdom";

// Types
interface Person {
  school: string;
  school_code: string;
  first_name: string;
  last_name: string;
  year: number | null;
  pronouns: string | null;
  college: string;
  email?: string;
  residence?: string;
  building_code?: string;
  entryway?: string;
  floor?: string;
  suite?: string;
  room?: string;
  birthday?: string;
  birth_month?: number;
  birth_day?: number;
  major?: string;
  visitor: boolean;
  access_code?: string;
  phone?: string;
  address: string;
  leave: boolean;
}

interface StudentContainer extends HTMLElement {
  querySelector(selector: string): HTMLElement | null;
  querySelectorAll(selector: string): NodeListOf<HTMLElement>;
}

export default class FacebookSource extends Source {
	private readonly cookie: string;
	private readonly majors: string[];
	private readonly majorFullNames: Record<string, string>;
	private readonly monthAbbreviations = [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
	];

	private static readonly ROOM_REGEX = /^([A-Z]+)-([A-Z]+)(\d+)(\d)([A-Z]+)?$/;
	private static readonly BIRTHDAY_REGEX = /^[A-Z][a-z]{2} \d{1,2}$/;
	private static readonly ACCESS_CODE_REGEX = /[0-9]-[0-9]+/;
	private static readonly PHONE_REGEX = /[0-9]{3}-[0-9]{3}-[0-9]{4}/;

	constructor(cache: any, cookie: string) {
		super(cache);
		this.cookie = cookie;
    
		// Load majors and major full names from files
		// Note: In a real implementation, these would be loaded from files
		this.majors = [];
		this.majorFullNames = {};
	}

	private async getHtml(): Promise<string> {
		// First request to set college
		await axios.get("https://students.yale.edu/facebook/ChangeCollege", {
			params: { newOrg: "Yale College" },
			headers: { Cookie: this.cookie },
		});

		// Second request to get student data
		const response = await axios.get("https://students.yale.edu/facebook/PhotoPageNew", {
			params: {
				currentIndex: -1,
				numberToGet: -1,
			},
			headers: { Cookie: this.cookie },
		});

		return response.data;
	}

	private parseRoom(room: string): { 
    building_code: string;
    entryway: string;
    floor: string;
    suite: string;
    room?: string;
  } | null {
		const match = room.match(FacebookSource.ROOM_REGEX);
		if (!match) return null;

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_, building_code, entryway, floor, suite, room_letter] = match;
		return {
			building_code,
			entryway,
			floor,
			suite,
			room: room_letter,
		};
	}

	private parseBirthday(birthday: string): { month: number; day: number } | null {
		if (!FacebookSource.BIRTHDAY_REGEX.test(birthday)) return null;
    
		const [month, day] = birthday.split(" ");
		return {
			month: this.monthAbbreviations.indexOf(month) + 1,
			day: parseInt(day, 10),
		};
	}

	private parseStudentContainer(container: StudentContainer): Person {
		const person: Person = {
			school: "Yale College",
			school_code: "YC",
			first_name: "",
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
		if (nameElement) {
			const [lastName, firstName] = nameElement.textContent?.split(", ") ?? ["", ""];
			person.last_name = lastName;
			person.first_name = firstName;
		}

		// Parse year
		const yearElement = container.querySelector(".student_year");
		if (yearElement?.textContent) {
			const yearText = yearElement.textContent.replace("'", "");
			person.year = yearText ? 2000 + parseInt(yearText, 10) : null;
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
				if (emailElement?.textContent) {
					person.email = emailElement.textContent;
				}

				// Process additional information
				const trivia = Array.from(infoElements[1].childNodes)
					.filter(node => node.nodeType === 3) // Text nodes only
					.map(node => node.textContent?.trim())
					.filter((text): text is string => !!text);

				this.processTrivia(person, trivia);
			}
		}

		return person;
	}

	private processTrivia(person: Person, trivia: string[]): void {
		// Process room if present
		if (trivia.length > 0 && FacebookSource.ROOM_REGEX.test(trivia[0])) {
			const room = trivia.shift()!;
			person.residence = room;
			const roomInfo = this.parseRoom(room);
			if (roomInfo) {
				Object.assign(person, roomInfo);
			}
		}

		// Process birthday if present
		if (trivia.length > 0 && FacebookSource.BIRTHDAY_REGEX.test(trivia[trivia.length - 1])) {
			const birthday = trivia.pop()!;
			person.birthday = birthday;
			const birthdayInfo = this.parseBirthday(birthday);
			if (birthdayInfo) {
				person.birth_month = birthdayInfo.month;
				person.birth_day = birthdayInfo.day;
			}
		}

		// Process major if present
		if (trivia.length > 0 && this.majors.includes(trivia[trivia.length - 1])) {
			const major = trivia.pop()!;
			person.major = this.majorFullNames[major] || major;
			person.visitor = major === "Visiting International Program";
		}

		// Process remaining trivia
		const remainingTrivia: string[] = [];
		for (const item of trivia) {
			const trimmed = item.replace(/ \/$/, "");
			if (FacebookSource.ACCESS_CODE_REGEX.test(trimmed)) {
				person.access_code = trimmed;
			} else if (FacebookSource.PHONE_REGEX.test(trimmed)) {
				person.phone = this.cleanPhone(trimmed);
			} else {
				remainingTrivia.push(item);
			}
		}

		// Handle address
		if (remainingTrivia.length >= 2 && remainingTrivia[0] === remainingTrivia[1] && !person.residence) {
			person.residence = remainingTrivia.shift();
		}
		person.address = remainingTrivia.join("\n");
	}

	async scrape(): Promise<void> {
		console.log("Scraping Facebook");
    
		const html = await this.getHtml();
		const dom = new JSDOM(html);
		const document = dom.window.document;
    
		const containers = document.querySelectorAll(".student_container");
    
		if (containers.length === 0) {
			console.log("No people found. There may be an authentication issue.");
			this.newRecords = [];
			return;
		}

		this.newRecords = Array.from(containers).map(container => 
			this.parseStudentContainer(container as unknown as StudentContainer),
		);

		console.log(`Scraped ${this.newRecords.length} records`);
	}
}
