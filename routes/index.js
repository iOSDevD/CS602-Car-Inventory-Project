import express from 'express';
const router = express.Router();

import * as util from '../util.js'

import {isAdminMode, isStaffMode, prepareAllCarData} from "../util.js";
import {apolloClient, gql} from "./apolloClientInit.js";
import {findAllCarsWithQuotes} from "../carInventoryModule.js";

router.use(function (req, res, next){
    console.log("Router Use");
    if (req.session.sessionData === undefined) {
        req.session.sessionData = {
            'filterSelection': [],
            'mySubmittedRequestIds': [],
            'admin': false
        };
    }
    next();
});

// GET request to the homepage
router.get('/', function (req, res){
    console.log("Home View hit", req.query.admin)
    res.redirect("/allCars")
});

router.get('/allCars', async function (req, res){
    console.log("AllCars hit")
    const fetchQuotes = isAdminMode(req) || isStaffMode(req)
    let result = await findAllCarsWithQuotes(fetchQuotes)
    res.format({
        'application/json': function (){
            res.json(result);
        },
        'text/html': function () {
            if(result.length>0) {
                res.render('allCars', prepareAllCarData(req,result));
            } else {
                res.render('noCarsData', prepareAllCarData(req,result));
            }
        },
        'default': () => {
            res.status(404);
            res.send("<b>404 - Not Found</b>");
        }
    })
});

router.post('/allCars', async function (req, res){
    console.log("AllCars Post hit",req.body)

    // Fill in the code
    let newCarProgram = !util.isEmptyOrNull(req.body.newCar)
    let certifiedCarProgram = !util.isEmptyOrNull(req.body.certifiedCar)

    let programs = []
    if (newCarProgram) {
        programs.push("new")
    }
    if (certifiedCarProgram) {
        programs.push("preowned")
    }

    let maxPrice = util.parseFloat(req.body.maxPrice)

    console.log("All Cars - newCarProgram  - certifiedCarProgram",newCarProgram,certifiedCarProgram)
    const QUERY_FIND_CARS_WITH_FILTER =
        `
          query FindCarsWithFilter($filter: CarsFilter!) {
              findCarsWithFilter(filter: $filter) {
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
                brand {
                  _id
                  brandName
                  vinnumbers
                }
              }
        }
        `

    const result = await apolloClient.query({
        query: gql(QUERY_FIND_CARS_WITH_FILTER),
        variables: {
                filter: {
                    program:  programs,
                    maxPrice: maxPrice
                }
            }
    });
    console.log("Requested ID's data ", result)
    const carData = result.data.findCarsWithFilter
    if(carData.length>0) {
        util.saveFilterToSession(req, newCarProgram, certifiedCarProgram, maxPrice)
        res.render('allCars', prepareAllCarData(req,carData));
    } else {
        res.render('noCarsData', prepareAllCarData(req,carData));
    }
});

router.get('/admin', function (req, res){
    console.log("Admin page hit")
    res.render("login/loginPage", { layout: false })
});


export {router};