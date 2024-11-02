import express, {Request, Response} from "express";

export default class PeopleRouter {
	getRouter = () => {
		const router = express.Router();
		router.get("/", this.getPeople);
		return router;
	}

	getPeople = (req: Request, res: Response) => {
		res.json([
			{
				name: "Eric",
				college: "TC",
			},
			{
				name: "Patrick",
				college: "PM",
			},
		]);
	}
};
