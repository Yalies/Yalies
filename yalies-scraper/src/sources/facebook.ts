import Source from "./source.js";
import Directory from "./directory.js";
import ImageUploader from "./s3/ImageUploader.js";
import DummyImageUploader from "./s3/DummyImageUploader.js";

import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { promises as fs } from "fs";
import { createCipheriv, createDecipheriv } from "crypto";

const FERNET_KEY = process.env.FERNET_KEY;
const logger = console; // using console as a basic logger for simplicity

let MAJORS: string[] = [];
let MAJOR_FULL_NAMES: { [key: string]: string } = {};

(async () => {
  MAJORS = (await fs.readFile("app/scraper/res/majors.txt", "utf-8")).split(
    "\n",
  );
  MAJOR_FULL_NAMES = JSON.parse(
    await fs.readFile("app/scraper/res/major_full_names.json", "utf-8"),
  );
})();

export default class FacebookSource extends Source {
  private cookie: string;
  private directory: Directory;
  private imageUploader: ImageUploader | DummyImageUploader;
  private cipher: any;

  private static RE_ROOM = /^([A-Z]+)-([A-Z]+)(\d+)(\d)([A-Z]+)?$/;
  private static RE_BIRTHDAY = /^[A-Z][a-z]{2} \d{1,2}$/;
  private static RE_ACCESS_CODE = /[0-9]-[0-9]+/;
  private static RE_PHONE = /[0-9]{3}-[0-9]{3}-[0-9]{4}/;

  constructor(cache: any, cookie: string, directory: Directory) {
    super(cache);
    this.cookie = cookie;
    this.directory = directory;

    // choose image uploader based on s3 credentials
    this.imageUploader = this.hasS3Credentials()
      ? new ImageUploader()
      : new DummyImageUploader();

    // initialize encryption
    const key = Buffer.from(FERNET_KEY!, "base64");
    this.cipher = createCipheriv("aes-256-gcm", key, Buffer.alloc(16, 0)); // example cipher setup
  }

  async getHtml(): Promise<string> {
    const filename = "page.html";

    try {
      await fs.access(filename);
      logger.info("Using cached page.");
      return await fs.readFile(filename, "utf-8");
    } catch {
      logger.info("Page not cached, fetching.");
      await fetch("https://students.yale.edu/facebook/ChangeCollege", {
        headers: { Cookie: this.cookie },
        method: "GET",
      });

      const response = await fetch(
        "https://students.yale.edu/facebook/PhotoPageNew",
        {
          headers: { Cookie: this.cookie },
          method: "GET",
        },
      );
      const html = await response.text();
      await fs.writeFile(filename, html, "utf-8");
      logger.info("Done fetching page.");
      return html;
    }
  }

  getTree(html: string): Document {
    logger.info("Building tree.");
    const dom = new JSDOM(html);
    return dom.window.document;
  }

  async scrape(currentPeople: any): Promise<any[]> {
    console.log("Scraping Facebook...");
    const html = await this.getHtml();
    const tree = this.getTree(html);
    const containers = Array.from(
      tree.querySelectorAll("div.student_container"),
    );

    if (containers.length === 0) {
      logger.info("No people found on this page.");
      return [];
    }

    const people = [];
    const emails: { [key: string]: number } = {};

    for (const container of containers) {
      const person: any = { school: "Yale College", school_code: "YC" };

      const nameEl = container.querySelector("h5.yalehead");
      if (nameEl) {
        const [lastName, firstName] = this.cleanName(nameEl.textContent || "");
        person.first_name = firstName;
        person.last_name = lastName;
      }

      const yearEl = container.querySelector("div.student_year");
      if (yearEl) person.year = this.cleanYear(yearEl.textContent || "");

      const pronounsEl = container.querySelector("div.student_info_pronoun");
      person.pronouns = pronounsEl
        ? pronounsEl.textContent?.replace(/[()]/g, "")
        : null;

      const infoEls = Array.from(
        container.querySelectorAll("div.student_info"),
      );
      if (infoEls.length > 0) {
        person.college = infoEls[0].textContent?.replace(" College", "");

        const emailEl = infoEls[1]?.querySelector("a");
        person.email = emailEl ? emailEl.textContent : null;
      }

      const trivia = Array.from(infoEls[1]?.childNodes || []).map(
        (node) => node.textContent?.trim() || "",
      );

      if (FacebookSource.RE_ROOM.test(trivia[0] || "")) {
        person.residence = trivia.shift();
      }

      const imageEl = container.querySelector("img");
      const imageId = this.cleanImageId(imageEl?.getAttribute("src") || "");
      if (imageId) {
        const imageFilename = await this.imageUploader.getImageFilename(
          imageId,
          person,
        );
        person.image = await this.imageUploader.uploadImage(imageFilename);
      }

      people.push(person);
    }

    return people;
  }

  cleanImageId(imageSrc: string): number | null {
    const imageId = parseInt(imageSrc.replace("/facebook/Photo?id=", ""));
    return isNaN(imageId) ? null : imageId;
  }

  cleanName(name: string): [string, string] {
    const [lastName, firstName] = name.split(", ");
    return [lastName.trim(), firstName.trim()];
  }

  cleanYear(year: string): number | null {
    const cleanedYear = year.replace("'", "");
    return cleanedYear ? 2000 + parseInt(cleanedYear) : null;
  }
}
