/**
 * CarInventoryModule helps to find a car using a VIN number or
 * look up all cars or look up all cars with quotes.
 */

import mongoose from 'mongoose';
import {dbURL}  from "./credentials.js";
import {Car} from
        './models/index.js';
import {apolloClient, gql} from "./routes/apolloClientInit.js";

export const connection = await mongoose.connect(dbURL);

export const lookupByVinnumber = async (id) =>{
    console.log("CarInventory: Lookup by VIN number:", id);
    let result = await Car.find({
        _id: id
    }).populate("brand")
    return JSON.parse(JSON.stringify(result));
}

/**
 * Find all the cars in the database, that are not deleted i.e
 * isDeleted is false or if isDeleted does exists it should be false.
 *
 * This can be used when `allCars` query is made using graphQL in
 * 'server_graphQL_apollo.j'. GQL query can be triggered from below
 * function `findAllCarsWithQuotes`.
 *
 * @returns {Promise<any>} All Cars in database.
 */
export const findAllCars = async () =>{
    console.log("CarInventory: Find all Cars");
    let result = await Car.find({
        $or: [
            { isDeleted: false },
            { isDeleted: { $exists: false } }
        ]
    }).populate("brand")
    return JSON.parse(JSON.stringify(result));
}

/**
 * Find all Cars and fetch Quotes as part of chaining.
 *
 * This is useful to show badge if the logged-in user has
 * an admin role or staff role, so when cars are fetched the list can show badge of
 * quotes being received.
 *
 * Query is made for GraphQL.
 *
 * @param fetchQuotes Pass true to fetch all cars with quotes else false.
 * @returns {Promise<any>} All Cars in the database.
 */
export const findAllCarsWithQuotes = async (fetchQuotes) => {
    console.log("CarInventory: Find all Cars fetchQuotes is ", fetchQuotes)

    let quoteDetails = ""
    if(fetchQuotes) {

        quoteDetails =
            `
              quotes {
                  _id
                }
            `
    } else {

    }
    const FIND_ALL_CARS =
        `
          query AllCars {
              allCars {
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
                  _id
                  brandName
                }
                horsePower
                mileageCity
                mileageHighway
                mileageCombined `
                    + quoteDetails
                +`
              }
            }
        `

    const result = await apolloClient.query({
        query: gql(FIND_ALL_CARS)
    });

    return JSON.parse(JSON.stringify(result.data.allCars));
}