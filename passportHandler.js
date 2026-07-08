/**
 * PassportHandler module that supports local strategy
 * and validates the users available with dbUsers.js.
 *
 * It serializes and deserializes the user while setting
 * the user and while accessing them from session.
 */

import passport from 'passport';

import {Strategy as LocalStrategy} from 'passport-local';
import { validateUser } from './dbUsers.js'

// configure passport strategy
passport.use(
    new LocalStrategy(
        function (username, password, cb) {
            process.nextTick(async function () {
                const user = await validateUser(username, password);
                if (!user) {
                    return cb(null, false,
                        { message: 'Incorrect username or password.' });
                }
                else {
                    return cb(null, user);
                }
            });
        }
    )
);

// Serialize user information
passport.serializeUser((user, cb) => {
    console.log("PassportHandler: Serialize", user);
    cb(null, {
        id: user.id,
        name: user.name,
        role: user.role
    });
});

// Deserialize user information
passport.deserializeUser((obj, cb) => {
    console.log("PassportHandler: DeSerialize", obj);
    cb(null, obj);
});

export { passport }