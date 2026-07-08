/**
 * Start Point for GraphQL server.
 * Provides endpoint for Graph QL. This module supports both queries and mutation.
 * Queries can be one of the following:
 *  - allCars: [Car] => Fetch all Cars
 *  - myRequestsUsingIds(ids: [String!]!): [CarQuote!]! => Fetch Car Quote for the provided request ids
 *  - findCarByVinNumber(vinNumber: String!): Car => Look up car for a vin number
 *  - findCarsWithFilter(filter: CarsFilter!): [Car]! => Look up all cars with provider filter.
 *  - allCarQuoteRequests:[CarQuote]! => Fetch all car quotes that are available in the database.
 *  - allBrands:[Brand]! => Fetch all car brands
 *
 * Mutation can be one of the following:
 *  - submitCarQuote(quoteData:
 *               SubmitCarQuoteData!): CarQuote! => A user can submit a request or quote to the dealer, insert into CarQuote model
 *  - upsertCar(carInputData: CarInput!): Car! => Upsert a Car (helps to insert a new car).
 *  - markAsReached(quoteId: String!): Boolean! => Mark a car quote submitted by the customer as reached by the dealership.
 *  - deleteCar(vinNumber: String!): Boolean! => Delete the car from by marking isDeleted=true for that car.
 *
 *  It also supports chaining i.e while fetching Car Object if the request is to fetch Brand object it can be chained.
 */
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer }
    from '@apollo/server/standalone';

import * as carInventory
    from '../carInventoryModule.js';
import mongoose from 'mongoose';
import {
    createMyRequestForCar,
    fetchAllCarQuoteRequests,
    fetchMyRequestsForIds,
    markQuoteAsReached
} from "./myRequestsDBHelper.js";
import {deleteCar, findCarForVinNumber, findCarsWithFilter, upsertCar} from "./carDBHelper.js";
import {Brand} from "../models/index.js";
import {CarQuote} from "../models/CarQuote.js";
import {findAllBrands} from "./brandsDBHelper.js";

const typeDefs_Queries = `#graphql
   type Car {
        _id: String
        vinNumber: String,
        carName: String,
        year: Int,
        engine: String,
        drive: String,
        category: String,
        price: Float,
        miles: Int,
        exteriorColor: String,
        interiorColor: String,
        mainImage: String,
        description: String,
        program: String,
        brand: Brand,
        horsePower: Float,
        mileageCity: Float,
        mileageHighway: Float,
        mileageCombined: Float,
        quotes: [CarQuote]
   }
   
   type Brand {
      _id: String!,
      brandName: String!,
      vinnumbers: [String]!
   }
   
   type CarQuote {
        _id: ID!
        sessionId: String!,
        email: String!,
        vinNumber: String!,
        note: String!,
        car: Car,
        reached: Boolean!
   }
  
  input CarsFilter {
    program: [String]
    maxPrice: Float
  }
  type Query {
    allCars: [Car]
    myRequestsUsingIds(ids: [String!]!): [CarQuote!]!
    findCarByVinNumber(vinNumber: String!): Car
    findCarsWithFilter(filter: CarsFilter!): [Car]!
    allCarQuoteRequests:[CarQuote]!
    allBrands:[Brand]!
  }
`;

// Query Resolvers with Chaining
const resolvers_Queries = {
    Query: {
        allCars: async (parent, args, context) => {
            const result = await carInventory.findAllCars()
            return result
        },
        myRequestsUsingIds: async (parent, args, context) => {
            console.log("ServerGraphQL: MyRequests for sessionId", args.ids)

            const objectIds = args.ids.map((element) => {
                return new mongoose.Types.ObjectId(element);
            })

            console.log("ServerGraphQL: MyRequests for Object IDs", objectIds)
            const result = await fetchMyRequestsForIds(objectIds)
            return result
        },
        findCarByVinNumber: async (parent, args, context) => {
            console.log("ServerGraphQL: findCarByVinNumber", args.vinNumber)
            const result = await findCarForVinNumber(args.vinNumber)
            return result
        },
        findCarsWithFilter: async (parent, args, context) => {
            console.log("ServerGraphQL: findCarsWithFilter", args.filter)
            const result = await findCarsWithFilter(args.filter.program, args.filter.maxPrice)
            return result
        },
        allCarQuoteRequests: async (parent, args, context) => {
            console.log("ServerGraphQL: allCarQuoteRequests")
            const result = await fetchAllCarQuoteRequests()
            return result
        },
        allBrands: async (parent, args, context) => {
            console.log("ServerGraphQL: allCarBrands")
            const result = await findAllBrands()
            return result
        }
    },
    CarQuote: {
        car:  async (parent, args, context) => {
            console.log("ServerGraphQL: (2) Parent car number", parent._id, " Args", args);
            const result = await parent.populate("car");
            return result.car;
        }
    },
    Car: {
        brand: async (parent, args, context) => {
            console.log("ServerGraphQL: (2) Parent car brand", parent.brand, " Args", args);
            //const result = await parent.populate("brand");
            const result = await Brand.findById(parent.brand)
            console.log("Result Brand by id",result)
            return result;
        },
        quotes: async (parent, args, context) => {
            console.log("ServerGraphQL: (2) Parent car quote", parent.vinNumber, " Args", args);
            const result = await CarQuote.find({vinNumber: parent.vinNumber})
            return result;
        },
    }
}


const typeDefs_Mutations = `#graphql
  type Mutation {
    submitCarQuote(quoteData: 
              SubmitCarQuoteData!): CarQuote!
     upsertCar(carInputData: CarInput!): Car!
     markAsReached(quoteId: String!): Boolean!
     deleteCar(vinNumber: String!): Boolean!
  }

  input SubmitCarQuoteData {
    note:  String!
    email:    String!
    vinNumber: String!
    sessionId: String!
    car: String!
  }
  
  input CarInput {
          vinNumber: String!,
          year: String!,
          brand: String!,
          carName: String!,
          engine: String!,
          drive: String!,
          category: String!,
          price: String!,
          description: String!,
          program: String!,
          miles: String!,
          interiorColor: String!,
          exteriorColor: String!,
          horsePower: String!,
          mileageCity: String!,
          mileageHighway: String!,
          mileageCombined: String!

    }

`

// mutation resolvers
const resolvers_Mutations = {
    Mutation: {
        submitCarQuote: async (parent, args, context) => {
            console.log("ServerGraphQL: Submit Car Quote", args);
            const { quoteData } = args;
            const result = await createMyRequestForCar(quoteData.sessionId, quoteData.vinNumber, quoteData.email, quoteData.note)
            return result;
        },
        upsertCar: async (parent, args, context) => {
            console.log("ServerGraphQL: UpsertCar", args);
            const { carInputData } = args;
            const result = await  upsertCar(carInputData)
            return result;
        },
        markAsReached: async (parent, args, context) => {
            console.log("ServerGraphQL: markAsReached", args.quoteId);
            const result = await markQuoteAsReached(args.quoteId)
            return result.reached == true
        },
        deleteCar: async (parent, args, context) => {
        console.log("ServerGraphQL: deleteCar", args.vinNumber);
        const result = await deleteCar(args.vinNumber)
        return result.isDeleted == true
    }
    }
}

const server = new ApolloServer(
    {typeDefs: [typeDefs_Queries, typeDefs_Mutations],
        resolvers: [resolvers_Queries, resolvers_Mutations]});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`ServerGraphQL: 🚀  Server ready at: ${url}`);