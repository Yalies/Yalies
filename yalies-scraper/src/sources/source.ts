interface Cache {
	get(key: string): Promise<any>;
	set(key: string, value: any): Promise<void>;
  }
  
  interface Record {
	[key: string]: any;
  }
  
  export default class Source {
	private cache: Cache;
	protected newRecords: Record[] | null = null;
	private readonly phoneCountryCodeRegex = /^\+1?\s/;
	private readonly phoneDisallowedCharactersRegex = /[A-Za-z()\s\-\.]/g;
  
	constructor(cache: Cache) {
	  this.cache = cache;
	}
  
	/**
	 * Cleans a phone number by removing country code and disallowed characters
	 */
	protected cleanPhone(phone: string | number | null): string | null {
	  if (!phone) return null;
	  
	  let phoneStr = phone.toString();
	  phoneStr = phoneStr.replace(this.phoneCountryCodeRegex, '');
	  phoneStr = phoneStr.replace(this.phoneDisallowedCharactersRegex, '');
	  
	  if (phoneStr === '1111111111') return null;
	  
	  return phoneStr;
	}
  
	/**
	 * Remove empty properties from a single record
	 */
	protected cleanOne(record: Record): Record {
	  return Object.fromEntries(
		Object.entries(record).filter(([_, value]) => 
		  value !== null && 
		  value !== undefined && 
		  value !== '' || 
		  typeof value === 'boolean'
		)
	  );
	}
  
	/**
	 * Remove empty properties from an array of records
	 */
	protected clean(records: Record[]): Record[] {
	  return records.map(record => this.cleanOne(record));
	}
  
	/**
	 * Main scraping implementation to be overridden by subclasses
	 */
	async scrape(currentRecords: Record[]): Promise<void> {
	  throw new Error("Not implemented by superclass");
	}
  
	/**
	 * Pull data either from cache or by scraping
	 */
	async pull(currentRecords: Record[]): Promise<Record[]> {
	  const cacheKey = `scraped_data.${this.constructor.name}`;
	  const cachedRecords = await this.cache.get(cacheKey);
  
	  if (cachedRecords) {
		this.newRecords = cachedRecords;
	  } else {
		await this.scrape(currentRecords);
		if (!this.newRecords) {
		  throw new Error("Scrape method must set newRecords");
		}
		this.newRecords = this.clean(this.newRecords);
		await this.cache.set(cacheKey, this.newRecords);
	  }
  
	  return this.newRecords;
	}
  
	/**
	 * Merge newly scraped records with existing records
	 */
	protected merge(currentPeople: Record[]): Record[] {
	  if (!this.newRecords) {
		throw new Error("No records to merge - must call pull() first");
	  }
	  return [...currentPeople, ...this.newRecords];
	}
  
	/**
	 * Integrate new records with existing ones and clean the result
	 */
	async integrate(currentPeople: Record[]): Promise<Record[]> {
	  const people = this.merge(currentPeople);
	  return this.clean(people);
	}
  
	/**
	 * Check if S3 credentials are set in environment variables
	 */
	protected hasS3Credentials(): boolean {
	  return !!(process.env.S3_ACCESS_KEY && process.env.S3_SECRET_ACCESS_KEY);
	}
  }