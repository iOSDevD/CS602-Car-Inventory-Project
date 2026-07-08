/**
 * CarFormHelper module that can help to get all list of supported
 * brands from database and engine options, drive options, car categories,
 * car programs from local array.
 *
 * These can be used to show a list in the form, ex: List of Brands to be selected
 * when admin tries to add a new car.
 */
import {apolloClient, gql} from "../apolloClientInit.js";

/**
 * List of all car brands in database "brands". Data is fetched using
 * GraphQL.
 * @returns {Promise<*>} List of all car brands in database "brands"
 */
export async function fetchAllBrands() {
    const QUERY_FETCH_ALL_CAR_BRANDS =
        `
            query AllBrands {
              allBrands {
                brandName
                _id
              }
            }
		`;

    const result = await apolloClient.query({
        query: gql(QUERY_FETCH_ALL_CAR_BRANDS),
        variables: {}
    });
    return result.data.allBrands
}

/**
 * List of all engine options stored in local array.
 * @returns {Promise<[{name: string, id: string},{name: string, id: string},{name: string, id: string},{name: string, id: string}]>} List of engine options.
 */
export async function fetchAllEngineOptions() {
    return [ {id:"v4-hybrid", name:"Hybrid v4"},
        {id: "v6-hybrid", name: "Hybrid v6"},
        {id:"v4", name: "V4"},
        {id: "v6", name:"V6"}]
}

/**
 * List of all drive options stored in local array.
 * @returns {Promise<[{name: string, id: string},{name: string, id: string},{name: string, id: string},{name: string, id: string}]>} List of drive options.
 */
export async function fetchAllDriveOptions() {
    return [ {"id":"awd", "name":"AWD"},
        {"id":"rwd","name":"RWD"},
        {"id":"fwd","name":"FWD"},
        {"id":"4wd","name":"4WD"}]
}

/**
 * List of all car categories stored in local array.
 * @returns {Promise<[{name: string, id: string},{name: string, id: string},{name: string, id: string}]>} List of car categories.
 */
export async function fetchAllCarCategories() {
    return [ {"id":"sedan", "name":"Sedan"},
        {"id":"suv","name":"SUV"},
        {"id":"truck","name":"Truck"}]
}

/**
 * List of all car programs stored in local array.
 * @returns {Promise<[{name: string, id: string},{name: string, id: string}]>} List of car programs.
 */
export async function fetchAllCarPrograms() {
    return [ {"id":"new", "name":"New Car"},
        {"id":"preowned","name":"Certified Car"}]
}