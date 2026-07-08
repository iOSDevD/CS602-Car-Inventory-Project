/**
 * AllRequest Router will help to show all the requests submitted by a customer
 * or staff and they can mark it as reached.
 */
import express from 'express';
import {apolloClient, gql} from "./apolloClientInit.js";
const allRequestsRouter = express.Router();

import {prepareAllRequestsData} from "../util.js";
import {ensureAuthorizedMultipleRoles} from "./auth/authHelper.js";

/**
 * GET request to show all the requests so far submitted to the dealership.
 * Only Staff or admin role has access to this.
 *
 * Content in AllRequests tab is shown using this router handling.
 *
 * It also supports a REST API with JSON format.
 */
allRequestsRouter.get('/allRequests', ensureAuthorizedMultipleRoles(['admin','staff']), async function (req, res){

    const QUERY_FETCH_ALL_CAR_QUOTES =
        `
            query AllCarQuoteRequests {
              allCarQuoteRequests {
                _id
                sessionId
                email
                vinNumber
                note
                reached
                car {
                  brand {
                    brandName
                  }
                  carName
                  price
                  year
                }
              }
            }
		`;

    const result = await apolloClient.query({
        query: gql(QUERY_FETCH_ALL_CAR_QUOTES),
        variables: {}
    });
    console.log("Requested ID's data ", result.data.allCarQuoteRequests)

    res.format({
        'application/json': function (){
            res.json(result);
        },
        'text/html': function () {
            res.render("allRequests/allRequests", prepareAllRequestsData(req,result.data.allCarQuoteRequests))
        },
        'default': () => {
            res.status(404);
            res.send("<b>404 - Not Found</b>");
        }
    })
})

/**
 * GET request to mark that the customer has been reached.
 * Only Staff or admin role has access to this.
 *
 * Once the request is mutated it simply redirects to the "AllRequests" tab.
 */
allRequestsRouter.get('/markAsReached/:quoteId', ensureAuthorizedMultipleRoles(['admin','staff']), async function (req, res) {
    console.log("Mark As Reached for quoteId",req.params.quoteId)

    const MARK_AS_REACHED =
        `
        mutation MarkAsReached($quoteId: String!) {
             markAsReached(quoteId: $quoteId)
        }
        `
    const result = await apolloClient.mutate({
        mutation: gql(MARK_AS_REACHED),
        variables: {
            quoteId: req.params.quoteId
        }
    });
    res.redirect("/allRequests")
})

export {allRequestsRouter}