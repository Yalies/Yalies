import express, { Request, Response, NextFunction } from "express";
import passport from "passport";

export default class CasRouter {
	getRouter = () => {
		const router = express.Router();
		router.get("/", this.casLogin);
		return router;
	}

	casLogin = (req: Request, res: Response, next: NextFunction) => {
		const authFunction = passport.authenticate("cas", (err: Error, user: Express.User) => {
			if(err) return res.status(500).json({ message: "Could not authenticate" });
			if(!user) return res.status(401).json({ message: "No user" });
			
			return req.logIn(user, async (err) => {
				if(err) return res.status(500).json({ message: "Could not log in" });
				
				return res.redirect("/");
			});
		});
		authFunction(req, res, next);
	}
};
