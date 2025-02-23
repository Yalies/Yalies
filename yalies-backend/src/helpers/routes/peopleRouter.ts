import express, {Request, Response} from "express";
import PersonModel, { PERSON_ALLOWED_FILTER_FIELDS } from "../models/PersonModel.js";
import { Op, Sequelize, WhereOptions } from "sequelize";
import CAS from "../cas.js";
import { Fn } from "sequelize/types/utils.js";

export default class PeopleRouter {
	getRouter = () => {
		const router = express.Router();
		router.post("/", CAS.requireAuthentication, this.getPeople);
		return router;
	};

	constructSimilarityQuery = (fn: Fn | string, query: string) =>
		Sequelize.where(
			Sequelize.fn(
				"similarity",
				fn,
				query,
			),
			{ [Op.gt]: 0.4 },
		);

	constructInitialsQuery = (initials: string) => {
		initials = initials.toUpperCase();
		return {
			[Op.and]: [
				Sequelize.where(
					Sequelize.fn("UPPER", Sequelize.fn("LEFT", Sequelize.col("first_name"), 1)),
					initials[0]
				),
				Sequelize.where(
					Sequelize.fn("UPPER", Sequelize.fn("LEFT", Sequelize.col("last_name"), 1)),
					initials[1]
				)
			]
		};
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
		let where: WhereOptions<PersonModel> = {};
		for(const field of Object.keys(filtersRaw)) {
			if(field === "initials") {
				const initials = filtersRaw[field][0];
				if(typeof initials === "string" && initials.length === 2) {
					where = {
						...where,
						...this.constructInitialsQuery(initials)
					};
				}
				continue;
			}

			if(!PERSON_ALLOWED_FILTER_FIELDS.includes(field)) {
				res.status(400).send(`Cannot filter by field ${field}`);
				return;
			}
			if(Array.isArray(filtersRaw[field])) {
				where = {
					...where,
					[field]: {
						[Op.in]: filtersRaw[field],
					}
				};
			} else {
				where = {
					...where,
					[field]: filtersRaw[field]
				};
			}
		}

		if(query) { // Fuzzy search using trigrams
			// Check if query is initials (2 letters)
			if(query.match(/^[a-z]{2}$/i)) {
				where = {
					...where,
					...this.constructInitialsQuery(query)
				};
			} else {
				where = {
					...where,
					[Op.or]: [ // match `first last` OR `first` OR `last`
						this.constructSimilarityQuery(
							Sequelize.fn(
								"first_last_name",
								Sequelize.col("first_name"),
								Sequelize.col("last_name"),
							),
							query,
						),
						this.constructSimilarityQuery(
							"first_name",
							query,
						),
						this.constructSimilarityQuery(
							"last_name",
							query,
						),
					],
				};
			}
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
