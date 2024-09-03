import express, {Request, Response, NextFunction} from "express";
import passport from "passport";
import passportCas, {Strategy} from "passport-cas";

// WIP

export default class CasRoute {
    constructor() {
        this.initializePassport();
    }

    initializePassport = () => {
        passport.use(
            new Strategy({
                version: "CAS2.0",
                ssoBaseURL: "https://secure.its.yale.edu/cas",
            }, async(profile, done) => {
                return done(null, { netId: profile.user });
            })
        );
        passport.serializeUser((user, done) => {
            done(null, user);
        })
        passport.deserializeUser((user, done) => {
            done(null, user);
        })
    }

    casLogin = (req: Request, res: Response, next: NextFunction) => {
        const authFunction = passport.authenticate("cas", (err: Error, user: Express.User) => {
            if(err) return next(err);
            if(!user) return next(new Error("No user"));
            return req.logIn(user, async (err) => {
                if(err) return next(err);
                return res.redirect("/"); // TODO
            });
        });
    }

	getRouter = () => {
	}
};
