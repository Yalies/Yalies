import {configDotenv} from "dotenv";
import WebServer from "./helpers/webServer.js";
import CAS from "./helpers/cas.js";
import DB from "./helpers/db.js";

configDotenv({
	path: process.env.NODE_ENV === "development" ? ".env.development" : ".env.production",
});

if(process.env.NODE_ENV === "development") console.log("******\nRunning in development mode.\n******\n\n");

new CAS();
const db = new DB();
new WebServer(db);
