import express, {Request, Response} from "express";
import PersonModel from "../models/PersonModel.js";

export default class PeopleRouter {
	getRouter = () => {
		const router = express.Router();
		// router.get("/", CAS.requireAuthentication, this.getPeople);
		router.post("/", this.getPeople);
		return router;
	};

	getPeople = async (req: Request, res: Response) => {
		let people: PersonModel[];
		try {
			people = await PersonModel.findAll({
				where: {
					school_code: "YC",
				},
				limit: 100,
			});
		} catch(e) {
			console.error(e);
			res.status(500).send("Error fetching people");
			return;
		}
		const json = people.map((person) => person.toSanitizedObject());
		res.status(200).json(json);
	};
};
