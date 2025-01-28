import express, {Request, Response} from "express";
import APIKeyModel from "../models/APIKeyModel.js";
import CAS from "../cas.js";
import { RequestUser } from "../types.js";
import { generateApiKey } from "../util.js";

export default class APIKeyRouter {
	getRouter = () => {
		const router = express.Router();
		router.post("/create", CAS.requireAuthentication, this.generateApiKey);
		router.post("/revoke", CAS.requireAuthentication, this.revokeApiKey);
		router.get("/list", CAS.requireAuthentication, this.listApiKeys);
		return router;
	};

	generateApiKey = async (req: Request, res: Response) => {
		const description = req.body.description || "";
		if(!description) return res.status(400).send("Description is required");

		const user = req.user as RequestUser;
		const { netId } = user;

		const key = generateApiKey();
		
		const newKey = APIKeyModel.build({
			owner_netid: netId,
			created_on: new Date(),
			description,
			key,
			uses_count: 0,
		});

		try {
			await newKey.save();
		} catch(e) {
			console.error(e);
			res.status(500).send("Error generating API key");
			return;
		}

		let newKeyEntry;
		try {
			newKeyEntry = await APIKeyModel.findOne({
				where: { key },
			});
		} catch(e) {
			console.error(e);
			res.status(500).send("Error fetching API key");
			return;
		}

		res.status(200).json({
			id: newKeyEntry.id,
			description: newKeyEntry.description,
			created_on: newKeyEntry.created_on,
			uses_count: newKeyEntry.uses_count,
			key: newKeyEntry.key,
		});
	};

	revokeApiKey = async (req: Request, res: Response) => {
		res.send("pong");
	};

	listApiKeys = async (req: Request, res: Response) => {
		const user = req.user as RequestUser;
		const { netId } = user;

		let keys: APIKeyModel[];
		try {
			keys = await APIKeyModel.findAll({
				where: { owner_netid: netId },
			});
		} catch(e) {
			console.error(e);
			res.status(500).send("Error fetching API keys");
			return;
		}
		const data = keys.map(key => ({
			id: key.id,
			description: key.description,
			created_on: key.created_on,
			uses_count: key.uses_count,
		}));
		res.status(200).json(data);
	};
};
