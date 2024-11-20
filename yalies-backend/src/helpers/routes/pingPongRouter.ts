import express, {Request, Response} from "express";
import CAS from "../cas.js";

export default class PingPongRouter {
	getRouter = () => {
		const router = express.Router();
		router.get("/", this.pingPong);
		router.get("/protected", CAS.requireAuthentication, this.pingPong);
		return router;
	};

	pingPong = (req: Request, res: Response) => {
		console.log(req.isAuthenticated());
		console.log(req.user);
		res.send("pong");
	};
};
