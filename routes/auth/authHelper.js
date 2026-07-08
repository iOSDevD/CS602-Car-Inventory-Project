/**
 * AuthHelper module to help validate multiple authorized roles or
 * a single authorized role.
 *
 * For example: admin or staff can see "All Requests". However only
 * "admin" can add a or delete a car.
 */
import {isEmptyOrNull} from "../../util.js";

/**
 * Check whether the logged-in user is admin or staff, which are authorized user's.
 *
 * @param requiredRoles admin or staff
 * @returns {(function(*, *, *): (*|undefined))|*} true for admin or staff for any other role its false.
 */
const ensureAuthorizedMultipleRoles = (requiredRoles) => {
    return (req, res, next) => {
        if (req.isAuthenticated) {
            const user = req.user;

            const roles = ["admin", "staff"]
            const matchingRoles = roles.filter((e) => {
                return e === user?.role
            })
            console.log("ensureAuthorizedMultipleRoles ", matchingRoles)
            if (matchingRoles.length > 0) {
                return next();
            } else {
                const name = user?.name ?? null
                console.log("Attempted to access a restricted resource by user",user,req.url)
                let message = "You don\'t have enough permission to access this resource"
                if(!isEmptyOrNull(name)) {
                    message = name + ", " + message
                }
                res.render('login/permissionError',
                    { user: name,
                        errorCode: '401',
                        message: message, layout: false});
            }
        } else {
            res.redirect('/admin');
        }
    }
}

/**
 * Check whether the logged-in user is admin, who is an authorized user.
 *
 * @param requiredRole admin
 * @returns {(function(*, *, *): (*|undefined))|*} true for admin, for any other role its false.
 */
const ensureAuthorized = (requiredRole) => {
    return (req, res, next) => {
        if (req.isAuthenticated) {
            const user = req.user;
            if (user?.role === requiredRole) {
                return next();
            } else {
                const name = user?.name ?? null
                console.log("Attempted to access a restricted resource by user",user,req.url)
                let message = "You don\'t have enough permission to access this resource"
                if(!isEmptyOrNull(name)) {
                    message = name + ", "+ message
                }
                res.render('login/permissionError',
                    { user: name,
                        errorCode: '401',
                        message: message, layout: false});
            }
        } else {
            res.redirect('/admin');
        }
    }
}

/**
 * Check if the user is authenticated or non-authenticated.
 *
 * It can be used to show logout button if the user is authenticated.
 *
 * @returns {*} True for logged-in user (staff or admin) else false.
 */
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin');
}

export {ensureAuthorized, ensureAuthenticated, ensureAuthorizedMultipleRoles}