/**
 * Module supports look up car by VIN number using graph QL.
 */

import {apolloClient, gql} from "../apolloClientInit.js";

/**
 * Find a car for a specified VIN number using graphQL.
 * @param vinNumber VIN number for which car needs to be searched.
 * @returns {Promise<*>}  Car for a specified VIN Number.
 */
export async function  findCarByVinNumberGQL(vinNumber) {
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
        variables: {vinNumber: vinNumber}
    });
    return result.data.findCarByVinNumber
}