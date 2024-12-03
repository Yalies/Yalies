import { Sequelize } from "sequelize";
import PersonModel from "./models/PersonModel.js";
import SessionModel from "./models/SessionModel.js";

export const SEQUELIZE_DEFINITION_OPTIONS = {
	paranoid: false,
	createdAt: false,
	updatedAt: false,
	deletedAt: false,
};

export default class DB {
	#sql: Sequelize;

	constructor() {
		this.#sql = new Sequelize(process.env.DATABASE_URL, {
			logging: false,
		});
		this.testConnection();
		this.registerModels();
	}

	getSql = () => this.#sql;

	testConnection = async () => {
		try {
			await this.#sql.authenticate();
			console.log("Connected to the database");
		} catch (error) {
			console.error("Unable to connect to the database:", error);
		}
	};

	registerModels = () => {
		PersonModel.initModel(this.#sql);
		SessionModel.initModel(this.#sql);
	};
};
