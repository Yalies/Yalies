# Yalies Backend

## Breaking API changes from V1
- `/people` fields: `residence`, `building_code`, `entryway`, `floor`, `suite`, `room` removed because they are no longer exposed by the Yale Face Book
- `/people` field `birthday` removed because it is redundant and locale-specific
- `/people` option `page` is now zero-indexed; i.e. first page starts at `page: 0`

## SQL details
- We're using `sequelize` library to interact with the database
- Right now, we're using SQLite for development and Postgres for production.
	- SQLite is hosted on your local machine, in a file
	- Postgres is hosted on Heroku (which uses AWS behind the scenes)
	- We're planning on migrating our deployment stack to Google Cloud, which uses SQLite. Luckily, sequelize is sql-agnostic
- Each model is stored in `src/helpers/models`
	- Each model is defined as a TypeScript class
	- Models are registered with sequelize, which forms a connection between the class and a table in the database
	- Static methods on the model classes can be called to query/update

## CAS details
- **passport**: a library that integrates authentication in Express
- **passport-cas**: a custom strategy for passport. Passport supports google, twitter, etc authentication, but these people made a custom one that supports CAS
- **express-session**: a library that allows you to store session data in the database

### Authentication flow
1. User tries to go to a protected route
2. Express session checks if there's authentication information; it's not there. user gets an Unauthorized error
3. User goes to `/login`
4. User is redirected to CAS login
5. User logs in to CAS; is redirected back to the CAS callback page
6. Data is committed to express-session and saved to the database
7. User is redirected to `/`
8. User tries to go to the protected route again
9. Express session checks if there's authentication information; it's there. User is allowed to go to the protected route
