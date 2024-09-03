import express, { Express } from "express";
import session from "express-session";
import PingPongRouter from "./routes/pingPongRoute.js";

export default class WebServer {
	#app: Express;

	constructor() {
		this.initializeExpress();
		this.initializeSubRouters();
		this.serve();
	}

	initializeExpress = () => {
		this.#app = express();
		this.#app.set("trust proxy", 1);
		this.#app.use(express.json());
		this.#app.use(express.urlencoded({ extended: true }));
	};

	initializeSubRouters = () => {
		const pingPongRouter = new PingPongRouter();
		this.#app.use("/ping", pingPongRouter.getRouter());
	}

	serve = () => {
		this.#app.listen(process.env.PORT, () => {
			console.log(`App running on port ${process.env.PORT}`);
		})
	}
}
