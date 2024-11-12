import express, {Request, Response} from "express";
import Person from "../models/Person.js";

export default class PeopleRouter {
	getRouter = () => {
		const router = express.Router();
		// router.get("/", CAS.requireAuthentication, this.getPeople);
		router.get("/", this.getPeople);
		return router;
	};

	getPeople = async (req: Request, res: Response) => {
		let people: Person[];
		try {
			people = await Person.findAll({
				where: {
					netid: "emy8",
				},
				// attributes: [ "netid", "upi" ],
			});
		} catch(e) {
			console.error(e);
			res.status(500).send("Error fetching people");
			return;
		}
		console.log(people[0].upi);
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
	};
};
