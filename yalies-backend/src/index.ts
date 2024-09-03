import {configDotenv} from "dotenv";
import WebServer from "./helpers/webServer.js";

configDotenv();

new WebServer();
