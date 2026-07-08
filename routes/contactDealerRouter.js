/**
 * This Router mainly handles contact dealer requests like to show
 * the form and submit the request to the dealership.
 */

import express from 'express';
import {apolloClient, gql} from "./apolloClientInit.js";
import {prepareContactDealerData, saveMySubmittedQuote} from "../util.js";

const contactDealerRouter = express.Router();

/**
 * GET request to show ContactDealer form UI.
 * It will fetch the CAR details using a VIN number and display the contact dealer form.
 */
contactDealerRouter.get('/contactDealer/:id', async function (req, res){
    let id = req.params.id;

    console.log("ContactDealer: Load form ", id, req.query.quoteId)
    const FIND_CAR_BY_VIN =
        `
            query FindCarByVinNumber($vinNumber: String!) {
              findCarByVinNumber(vinNumber: $vinNumber) {
                _id
                vinNumber
                carName
                year
                engine
                drive
                category
                price
                miles
                exteriorColor
                interiorColor
                mainImage
                description
                program
                brand {
                    brandName
                    _id
                   }
                mileageCity
                mileageCombined
                mileageHighway
                horsePower     
              }
            }
		`;

    const result = await apolloClient.query({
        query: gql(FIND_CAR_BY_VIN),
        variables: {vinNumber: id}
    });

    res.render("contactDealerForm", prepareContactDealerData(req,result.data.findCarByVinNumber))
});

/**
 * Handle Post data request when user submits a contact dealer form requests.
 *
 * If the submitted request was a success it redirects user to "MyRequests" tab
 * else redirects to "allCars" tab and logs the response in console.
 */
contactDealerRouter.post('/contactDealer/:id', async function(req, res) {
    let vinNumber = req.params.id;
    let note = req.body.note;
    let email = req.body.email;
    console.log("ContactDealer: Request: ",vinNumber,note,email,req.session.id)

    const SUBMIT_CAR_QUOTE =
        `
             mutation SubmitCarQuote($quoteData: SubmitCarQuoteData!) {
              submitCarQuote(quoteData: $quoteData) {
                _id
                sessionId
                email
                vinNumber
                note
              }
            }
		`;
    const result = await apolloClient.mutate({
        mutation: gql(SUBMIT_CAR_QUOTE),
        variables: {
            quoteData: {
                note: note,
                email: email,
                vinNumber: vinNumber,
                sessionId: req.session.id,
                car: vinNumber
            }
        }
    });
    console.log("ContactDealer: Response: GraphQL", result.data)

    if(result.data.submitCarQuote.sessionId == req.session.id) {
        // success
        console.log("ContactDealer: Response Success")
        saveMySubmittedQuote(req, result.data.submitCarQuote._id, vinNumber )
        res.redirect("/myRequests")
    } else {
        // failed
        console.log("ContactDealer: Response Failed")
        res.render("allCars", {
            mainViewData: {
                allCarsTab : "active",
                newCarsTab: "",
                certifiedCarsTab: "",
                offerCarsTab : "",
                myRequestsTab: ""
            }
        })
    }
});

export {contactDealerRouter};