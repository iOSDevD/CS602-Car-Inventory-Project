/**
 * Logout router handles logout related functionality.
 */
import express from 'express';
import {ensureAuthenticated} from "./auth/authHelper.js";

const logoutRouter = express.Router();

/**
 * GET request that supports logout only if the user is Authenticated.
 * On success, it will redirect the user to admin page.
 */
logoutRouter.get('/logout',ensureAuthenticated, async function (req, res){
    console.log("Logout: Handle Logout")
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/admin');
    });
})

export { logoutRouter }
