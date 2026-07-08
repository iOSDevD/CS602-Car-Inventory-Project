/**
 * This  router mainly handles functionality to show Delete car UI
 * and handle submit delete POST method.
 *
 * POST method supports both JSON and HTML.
 */

import express from 'express';
import {
    prepareAddCarData,
    prepareDeleteCarFailedData,
    prepareDeleteCarSuccessData
} from "../util.js";
import {findCarByVinNumberGQL} from "./helpers/findCarHelperGQL.js";
import {
    fetchAllBrands, fetchAllCarCategories,
    fetchAllCarPrograms,
    fetchAllDriveOptions,
    fetchAllEngineOptions
} from "./helpers/carFormHelper.js"
import {apolloClient, gql} from "./apolloClientInit.js";
import {ensureAuthorized} from "./auth/authHelper.js";

const deleteCarRouter = express.Router();

/**
 * GET request to show Delete Car UI, restricted to Admin role only
 */
deleteCarRouter.get('/deleteCar/:vinNumber',ensureAuthorized("admin"), async function (req, res) {
    let id = req.params.vinNumber;
    console.log("DeleteCar: Params: UI: ",req.params)
    let carData = await findCarByVinNumberGQL(id)
    console.log("DeleteCar: FoundCar for VIN: UI  ",carData)
    let allBrands =  await fetchAllBrands()
    let allCarPrograms = await fetchAllCarPrograms()
    let allEngineOptions =  await fetchAllEngineOptions()
    let allDriveOptions = await fetchAllDriveOptions()
    let allCarCategories = await fetchAllCarCategories()
    res.render("addCar/addCar", prepareAddCarData(req,{
        allBrands: allBrands,
        allCarPrograms: allCarPrograms,
        allEngineOptions: allEngineOptions,
        allDriveOptions: allDriveOptions,
        allCarCategories: allCarCategories,
        carData: carData
    },"delete"))
})

/**
 * GET request that actually deletes the car by marking it as isDeleted,
 * restricted to Admin role only.
 *
 * It also supports a REST API with JSON format.
 */
deleteCarRouter.get('/deleteFinal/:vinNumber', ensureAuthorized("admin"), async function (req, res) {
    let vinNumber = req.params.vinNumber;

    const DELETE_CAR =
        `
            mutation DeleteCar($vinNumber: String!) {
              deleteCar(vinNumber: $vinNumber)
            }
        `

    const result = await apolloClient.mutate({
        mutation: gql(DELETE_CAR),
        variables: {
            vinNumber: vinNumber
        }
    });

    console.log("DeleteCar: Delete: Response From GraphQL: ",result.data)

    res.format({
        'application/json': function (){
            res.json(result);
        },
        'text/html': function () {
            if(result.data.deleteCar) {
                res.render('carDeletion/carDeletionSuccess',prepareDeleteCarSuccessData(vinNumber,req));
            } else {
                res.render('carDeletion/carDeletionFailed',prepareDeleteCarFailedData(req));
            }
        },
        'default': () => {
            res.status(404);
            res.send("<b>404 - Not Found</b>");
        }
    })

})

export  {deleteCarRouter}