/**
 * MyRequest router handles the requests for a user who had
 * submitted the request or shown an interest in a car.
 *
 * The customers can submit multiple requests and this router fetches
 * the submitted request id from the session data and displays a list.
 */
import express from 'express';
import {apolloClient, gql} from "./apolloClientInit.js";
const myRequestsRouter = express.Router();

import {getSubmittedQuoteIds, prepareMyRequestsData} from "../util.js";

/**
 * GET request that helps to show the submitted requests, the request id's
 * are stored in the fetch.
 *
 * It will fetch all the requests for that session and show it to the customer.
 */
myRequestsRouter.get('/myRequests', async function (req, res){
    console.log("MyRequest: Hit: ",req.session.id)
    const submittedRequestIds = getSubmittedQuoteIds(req)
    console.log("MyRequest: RequestIds in Session: ",submittedRequestIds)
    if (submittedRequestIds.length>0){
        // There are few requests that are submitted
        const QUERY_FETCH_ALL_MY_REQUESTS =
            `
		    query MyRequestsUsingIds($ids: [String!]!) {
                      myRequestsUsingIds(ids: $ids) {
                        _id
                        email
                        note
                        sessionId
                        vinNumber
                        car {
                          brand {
                            brandName
                          }
                          carName
                          year
                          price
                          miles
                          mainImage
                        }
                      }
                    }
		`;

        const result = await apolloClient.query({
            query: gql(QUERY_FETCH_ALL_MY_REQUESTS),
            variables: {ids: submittedRequestIds}
        });
        console.log("MyRequest: RequestId's GraphQL Response: ",result.data.myRequestsUsingIds)
        res.render('myRequests/myRequests', prepareMyRequestsData(req,result.data.myRequestsUsingIds));
    } else {
        // no requests have been submitted so far.
        console.log("MyRequest: No requests in session")
        res.render('myRequests/noRequestsFound', prepareMyRequestsData(req,{}));
    }
});

export  {myRequestsRouter}