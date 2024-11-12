import { DataTypes, Model, Sequelize } from "sequelize";

export default class Person extends Model {
/*
# Identifiers
    netid = db.Column(db.String)
    upi = db.Column(db.Integer)
    email = db.Column(db.String)
    mailbox = db.Column(db.String)
    phone = db.Column(db.String)
    fax = db.Column(db.String)

    # Naming
    title = db.Column(db.String)
    first_name = db.Column(db.String, nullable=False)
    preferred_name = db.Column(db.String)
    middle_name = db.Column(db.String)
    last_name = db.Column(db.String, nullable=False)
    suffix = db.Column(db.String)
    pronouns = db.Column(db.String)

    phonetic_name = db.Column(db.String)
    name_recording = db.Column(db.String)

    # Miscellaneous
    address = db.Column(db.String)

    # Students
    school_code = db.Column(db.String)
    school = db.Column(db.String)
    year = db.Column(db.Integer)
    curriculum = db.Column(db.String)
    # Undergrads
    college = db.Column(db.String)
    college_code = db.Column(db.String)
    leave = db.Column(db.Boolean)
    visitor = db.Column(db.Boolean)
    image = db.Column(db.String)
    birthday = db.Column(db.String)
    birth_month = db.Column(db.Integer)
    birth_day = db.Column(db.Integer)
    residence = db.Column(db.String)
    building_code = db.Column(db.String)
    entryway = db.Column(db.String)
    floor = db.Column(db.Integer)
    suite = db.Column(db.Integer)
    room = db.Column(db.String)
    major = db.Column(db.String)
    access_code = db.Column(db.String)

    # Staff
    organization_code = db.Column(db.String)
    organization = db.Column(db.String)
    unit_class = db.Column(db.String)
    unit_code = db.Column(db.String)
    unit = db.Column(db.String)
    postal_address = db.Column(db.String)
    office_building = db.Column(db.String)
    office_room = db.Column(db.String)
    cv = db.Column(db.String)
    profile = db.Column(db.String)
    website = db.Column(db.String)
    education = db.Column(db.String)
    publications = db.Column(db.String)
	*/

	// Identifiers
	declare netid: string;
	declare upi: number;
	declare email: string;

	// Naming
	declare title: string;
	declare first_name: string;
	declare preferred_name: string;
	declare middle_name: string;
	declare last_name: string;
	declare suffix: string;
	declare pronouns: string;

	declare phonetic_name: string;
	declare name_recording: string;

	// Miscellaneous
	declare address: string;

	// Students
	declare school_code: string;
	declare year: number;
	declare curriculum: string;
	// Undergrads
	declare college_code: string;
	declare leave: boolean;
	declare visitor: boolean;
	declare image: string;
	declare birth_month: number;
	declare birth_day: number;
	declare residence: string;
	declare building_code: string;
	declare entryway: string;
	declare floor: number;
	declare suite: number;
	declare room: string;
	declare major: string;
	declare access_code: string;

	// Staff
	declare organization_code: string;
	declare unit_class: string;
	declare unit_code: string;
	declare unit: string;
	declare postal_address: string;
	declare office_building: string;
	declare office_room: string;
	declare cv: string;
	declare profile: string;
	declare website: string;
	declare education: string;
	declare publications: string;
	

	/**
	 * Makes sequelize aware of the model, linking the TS class to a database table.
	 * See https://sequelize.org/docs/v6/other-topics/typescript/
	 * @param sequelize The sequelize instance
	 */
	static initModel(sequelize: Sequelize) {
		Person.init({
			id: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			netid: {
				type: DataTypes.STRING,
			},
			upi: {
				type: DataTypes.INTEGER,
			},
			email: {
				type: DataTypes.STRING,
			},
		}, {
			sequelize,
			tableName: "person",
		});
	}
};
