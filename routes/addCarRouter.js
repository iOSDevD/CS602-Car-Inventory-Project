/**
 * AddCarRouter handles showing of the add car UI which can be
 * added only by an admin.
 *
 * Once the car details are added to the form, admin can submit it to
 * the database to add it to the database.
 */
import express from 'express';
import {apolloClient, gql} from "./apolloClientInit.js";
import {prepareAddCarData} from "../util.js";
import {
    fetchAllBrands, fetchAllCarCategories,
    fetchAllCarPrograms,
    fetchAllDriveOptions,
    fetchAllEngineOptions
} from "./helpers/carFormHelper.js";
import {ensureAuthorized} from "./auth/authHelper.js";


const addCarRouter = express.Router();

/**
 * GET request to show addCar UI to the admin user.
 */
addCarRouter.get('/addCar',ensureAuthorized('admin'), async function (req, res){
    console.log("Add Car")

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
        carData: {}
    },"add"))
})

/**
 * POST request submitted by the form to add car to database.
 * It's restricted to admin user only.
 *
 * It also supports a REST API with JSON format.
 */
addCarRouter.post('/addCar', ensureAuthorized("admin"), async function (req, res){
    console.log("Add a Car", req.body)

    const ADD_NEW_CAR =
        `
           mutation UpsertCar($carInputData: CarInput!) {
              upsertCar(carInputData: $carInputData) {
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
                horsePower
                mileageCity
                mileageHighway
                mileageCombined
            
              }
            }
        `

    const result = await apolloClient.mutate({
        mutation: gql(ADD_NEW_CAR),
        variables: {
            carInputData: req.body
        }
    });

    res.format({
        'application/json': function (){
            res.json(result);
        },
        'text/html': function () {
            res.redirect("allCars")
        },
        'default': () => {
            res.status(404);
            res.send("<b>404 - Not Found</b>");
        }
    })
})

export {addCarRouter};