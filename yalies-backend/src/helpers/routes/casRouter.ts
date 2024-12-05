import express, { Request, Response, NextFunction } from "express";
import passport from "passport";

export default class CasRouter {
	getRouter = () => {
		const router = express.Router();
		router.get("/", this.casLogin);
		router.get("/logout", this.logout);
		return router;
	};

	casLogin = (req: Request, res: Response, next: NextFunction) => {
		const authFunction = passport.authenticate("cas", (err: Error, user: Express.User) => {
			if(err) {
				console.error(err);
				return res.status(500).json({ message: "Could not authenticate" });
			}
			if(!user) return res.status(401).json({ message: "No user" });
			
			return req.logIn(user, async (err) => {
				if(err) return res.status(500).json({ message: "Could not log in" });
				return res.redirect(process.env.FRONTEND_URL + "/");
			});
		});
		authFunction(req, res, next);
	};

	logout = (req: Request, res: Response) => {
		req.session.destroy(() => {
			req.logout({}, () => {
				res.redirect(process.env.FRONTEND_URL + "/");
			});
		});
	};
};
