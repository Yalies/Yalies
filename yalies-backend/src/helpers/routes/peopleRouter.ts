import express, {Request, Response} from "express";
import PersonModel, { PERSON_ALLOWED_FILTER_FIELDS } from "../models/PersonModel.js";
import { Op, Sequelize, WhereOptions } from "sequelize";
import CAS from "../cas.js";

export default class PeopleRouter {
	getRouter = () => {
		const router = express.Router();
		router.post("/", CAS.requireAuthentication, this.getPeople);
		return router;
	};

	getPeople = async (req: Request, res: Response) => {
		const query = req.body.query || "";
		const filtersRaw = req.body.filters || {};
		const page = req.body.page || 0;
		const pageSize = req.body.page_size || 100;

		if(pageSize > 100 || pageSize < 1) {
			res.status(400).send("Page size must be between 1 and 100");
			return;
		}

		// Go through filters and construct a where query
		let where: WhereOptions = {};
		for(const field of Object.keys(filtersRaw)) {
			if(!PERSON_ALLOWED_FILTER_FIELDS.includes(field)) {
				res.status(400).send(`Cannot filter by field ${field}`);
				return;
			}
			if(Array.isArray(field)) {
				where[field] = {
					[Op.in]: filtersRaw[field],
				};
			} else {
				where[field] = filtersRaw[field];
			}
		}

		// TODO: Replace with proper ElasticSearch query
		if(query) {
			where = {
				...where,
				[Op.or]: [
					{first_name: {
						[Op.iLike]: `%${query}%`,
					}},
					{last_name: {
						[Op.iLike]: `%${query}%`,
					}},
					Sequelize.where(
						Sequelize.fn("concat", Sequelize.col("first_name"), " ", Sequelize.col("last_name")),
						{
							[Op.iLike]: `%${query}%`,
						},
					),
				],
			};
		}

		let people: PersonModel[];
		try {
			people = await PersonModel.findAll({
				where,
				limit: pageSize,
				offset: page * pageSize,
				order: [["last_name", "ASC"], ["first_name", "ASC"]],
				replacements: { query: `%${query}%` },
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
