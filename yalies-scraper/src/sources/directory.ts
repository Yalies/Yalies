// import Source from "./source.js";
// import axios from "axios";

// interface DirectoryEntry {
//   netid: string;
//   upi: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   directory_title: string;
//   known_as: string;
//   middle_name: string;
//   suffix: string;
//   phone_number: string;
//   residential_college_name: string;
//   residential_college_code: string;
//   primary_school_name: string;
//   primary_school_code: string;
//   organization_name: string;
//   organization_unit_name: string;
//   primary_organization_code: string;
//   student_curriculum: string;
//   mailbox: string;
//   postal_address: string;
//   student_address: string;
//   registered_address: string;
//   internal_location: string;
//   student_expected_graduation_year: string;
//   primary_organization_name: string;
//   primary_division_name: string;
// }

// class YaleDirectoryAPI {
// 	private readonly baseUrl = "https://directory.yale.edu/api";
// 	private readonly sessionCookie: string;
// 	private readonly csrfToken: string;
  
// 	constructor(sessionCookie: string, csrfToken: string) {
// 	  this.sessionCookie = sessionCookie;
// 	  this.csrfToken = csrfToken;
// 	}
  
// 	private getHeaders() {
// 	  return {
// 			"Cookie": this.sessionCookie,
// 			"X-CSRF-Token": this.csrfToken,
// 			"Content-Type": "application/json",
// 	  };
// 	}
  
// 	async people(options: {
// 	  netid?: string;
// 	  first_name?: string;
// 	  last_name?: string;
// 	  email?: string;
// 	  college?: string;
// 	  school?: string;
// 	  include_total?: boolean;
// 	}): Promise<DirectoryEntry[]> {
// 	  try {
// 			const response = await axios.get(`${this.baseUrl}/people`, {
// 		  params: options,
// 		  headers: this.getHeaders(),
// 			});
  
// 			if (response.data && Array.isArray(response.data.people)) {
// 		  return response.data.people;
// 			}
// 			return [];
// 	  } catch (error) {
// 			console.error("Error fetching from directory:", error);
// 			return [];
// 	  }
// 	}
  
// 	async person(options: { first_name: string; last_name: string }): Promise<DirectoryEntry | null> {
// 	  try {
// 			const response = await axios.get(`${this.baseUrl}/person`, {
// 		  params: options,
// 		  headers: this.getHeaders(),
// 			});
  
// 			if (response.data && response.data.person) {
// 		  return response.data.person;
// 			}
// 			return null;
// 	  } catch (error) {
// 			console.error("Error fetching person from directory:", error);
// 			return null;
// 	  }
// 	}
// }

// export default class DirectorySource extends Source {
// 	private static readonly THREAD_COUNT = 3;
// 	private static readonly LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
// 	private static readonly NUMBERS = "0123456789".split("");
// 	private static readonly CHARACTERS = [...DirectorySource.LETTERS, ...DirectorySource.NUMBERS];

// 	private static readonly SCHOOL_OVERRIDES: Record<string, string> = {
// 		"School of Law": "Law School",
// 		"Graduate School of Arts & Sci": "Graduate School of Arts & Sciences",
// 	};
	
// 	private static readonly SCHOOL_CODES: Record<string, string> = {
// 		"Divinity School": "DI",
// 		"Graduate School of Arts & Sciences": "GS",
// 		"Law School": "LW",
// 		"School of Management": "MG",
// 		"School of Medicine": "MD",
// 		"School of Nursing": "NR",
// 		"School of the Environment": "FS",
// 		"School of Public Health": "PH",
// 	};

// 	private directory: YaleDirectoryAPI;
// 	private prefixQueue: string[] = [];
// 	private directoryEntries: DirectoryEntry[] = [];

// 	constructor(cache: any, peopleSearchSessionCookie: string, csrfToken: string) {
// 		super(cache);
// 		this.directory = new YaleDirectoryAPI(peopleSearchSessionCookie, csrfToken);
// 	}

// 	private splitCodeName(combined: string | null): [string | null, string | null] {
// 		if (!combined) return [null, null];
// 		const ID_RE = /^[A-Z_]+$/;
// 		const [id, ...nameParts] = combined.split(" ");
// 		return ID_RE.test(id) ? [id, nameParts.join(" ")] : ["", combined];
// 	}

// 	private splitOffice(office: string | null): [string | null, string | null] {
// 		if (!office) return [null, null];
// 		const components = office.split(" > ");
// 		return [components[0], components.length > 1 ? components[1] : null];
// 	}

// 	private async readDirectory(prefix: string = ""): Promise<DirectoryEntry[]> {
// 		console.log(`Attempting prefix ${prefix}`);
    
// 		const people = await this.directory.people({ netid: prefix, include_total: true });

// 		if (people.length < 1000) {  // Assuming this is our limit per request
// 			console.log(`Successfully found ${people.length} people.`);
// 			return people;
// 		}

// 		console.log(`Found ${people.length} people; trying more specific prefixes.`);

// 		const MIN_CHARS_IN_PREFIX = 2;
// 		const MAX_CHARS_IN_PREFIX = 3;

// 		let choices: string[];
// 		if (prefix.length < MIN_CHARS_IN_PREFIX) {
// 			choices = DirectorySource.LETTERS;
// 		} else if (
// 			prefix.length >= MAX_CHARS_IN_PREFIX && 
//       DirectorySource.NUMBERS.includes(prefix[prefix.length - 1])
// 		) {
// 			choices = DirectorySource.NUMBERS;
// 		} else {
// 			choices = DirectorySource.CHARACTERS;
// 		}

// 		for (const choice of choices) {
// 			this.prefixQueue.push(prefix + choice);
// 		}

// 		return [];
// 	}

// 	private mergeOne(person: Record<string, any>, entry: DirectoryEntry): Record<string, any> {
// 		let school = person.school || entry.primary_school_name;
// 		school = DirectorySource.SCHOOL_OVERRIDES[school] || school;
    
// 		let schoolCode = person.school_code || entry.primary_school_code;
// 		if (!schoolCode) {
// 			schoolCode = DirectorySource.SCHOOL_CODES[school];
// 		}

// 		const [organizationCode, organizationTemp] = this.splitCodeName(entry.organization_name);
// 		const [unitClass, unit] = this.splitCodeName(entry.organization_unit_name);
// 		const [officeBuilding, officeRoom] = this.splitOffice(entry.internal_location);

// 		const merged: Record<string, any> = {
// 			...person,
// 			netid: entry.netid,
// 			upi: entry.upi,
// 			email: person.email || entry.email,
// 			first_name: entry.first_name,
// 			last_name: entry.last_name,
// 			title: entry.directory_title,
// 			preferred_name: entry.known_as !== entry.first_name ? entry.known_as : null,
// 			middle_name: entry.middle_name,
// 			suffix: entry.suffix,
// 			phone: person.phone || this.cleanPhone(entry.phone_number),
// 			college: person.college || entry.residential_college_name.replace(" College", ""),
// 			college_code: entry.residential_college_code,
// 			school,
// 			school_code: schoolCode,
// 			organization_code: organizationCode,
// 			organization: organizationTemp,
// 			unit_class: unitClass,
// 			unit,
// 			unit_code: entry.primary_organization_code,
// 			curriculum: entry.student_curriculum,
// 			mailbox: entry.mailbox,
// 			postal_address: entry.postal_address,
// 			address: person.address || entry.student_address || entry.registered_address,
// 			office_building: officeBuilding,
// 			office_room: officeRoom,
// 		};

// 		if (merged.college === "Undeclared") {
// 			merged.college = null;
// 		}

// 		if (!merged.year && entry.student_expected_graduation_year) {
// 			merged.year = parseInt(entry.student_expected_graduation_year, 10);
// 		}

// 		return merged;
// 	}

// 	async scrape(): Promise<void> {
// 		console.log("Scraping directory");
    
// 		// Initialize queue with single letters
// 		this.prefixQueue = [...DirectorySource.LETTERS];
    
// 		// Process queue
// 		while (this.prefixQueue.length > 0) {
// 			const prefix = this.prefixQueue.pop();
// 			if (!prefix) continue;
      
// 			const entries = await this.readDirectory(prefix);
// 			this.directoryEntries.push(...entries);
// 		}

// 		// Process entries into records
// 		this.newRecords = this.directoryEntries
// 			.filter(entry => !entry.netid?.startsWith("etrain"))
// 			.map(entry => this.mergeOne({}, entry));

// 		console.log(`Scraped ${this.newRecords.length} records`);
// 	}
  
// 	protected merge(currentPeople: Record<string, any>[]): Record<string, any>[] {
// 		const checkedNetids = new Set(
// 			currentPeople
// 				.filter(person => person.netid)
// 				.map(person => person.netid),
// 		);

// 		const newEntries = this.newRecords?.filter(
// 			person => person.netid && !checkedNetids.has(person.netid),
// 		) || [];

// 		return [...currentPeople, ...newEntries];
// 	}
// }
