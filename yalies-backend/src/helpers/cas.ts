import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy } from "passport-cas";
import PersonModel from "./models/PersonModel.js";
import { RequestUser } from "./types.js";

export default class CAS {
	constructor() {
		this.initializePassport();
	}

	initializePassport = () => {
		passport.use(
			new Strategy(
				{
					version: "CAS2.0",
					ssoBaseURL: "https://secure.its.yale.edu/cas",
				},
				async (profile, done) => {
					return done(null, { netId: profile.user });
				},
			),
		);
		passport.serializeUser((user, done) => {
			done(null, user);
		});
		passport.deserializeUser((user, done) => {
			done(null, user);
		});
	};

	static requireAuthentication = async (req: Request, res: Response, next: NextFunction) => {
		if (!req.isAuthenticated() || !req.user) return res.status(401).json({ message: "Unauthorized" });
		const user = req.user as RequestUser;
		if(!user.netId) return res.status(401).json({ message: "No netId associated with logged-in user" });

		let person: PersonModel | null;
		try {
			person = await PersonModel.findOne({
				where: { netid: user.netId },
			});
		} catch(e) {
			console.error(e);
			return res.status(500).send("Error fetching people while authenticating");
		}
		if(!person) return res.status(403).send("Not in directory");
		// TODO: Decide if we want to only allow YC students
		
		return next();
	};
}
