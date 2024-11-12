import { Sequelize } from "sequelize";
import Person from "./models/Person.js";

export default class DB {
	#sql: Sequelize;

	constructor() {
		this.#sql = new Sequelize(process.env.DATABASE_URL, {
			dialectOptions: {
				ssl: {
					require: true,
					rejectUnauthorized: false,
				},
			},
		});
		this.testConnection();
		this.registerModels();
	}

	testConnection = async () => {
		try {
			await this.#sql.authenticate();
			console.log("Connected to the database");
		} catch (error) {
			console.error("Unable to connect to the database:", error);
		}
	};

	registerModels = () => {
		Person.initModel(this.#sql);
	};
};
