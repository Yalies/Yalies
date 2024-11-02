# Yalies Backend

## Getting Started
- `nvm use`
- `npm install`
- `cp .env.template .env`, fill in the values

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
