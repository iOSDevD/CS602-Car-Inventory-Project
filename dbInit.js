/**
 * This is the DB initialization script that be executed by calling
 * `node dbInit`.
 *
 * It will populate the database with cars and brands from
 * cs602_project_car_inventory.json and cs602_project_car_inventory.json respectively.
 *
 * Running this script will delete the collection and recreate again.
 */
import fs from 'node:fs';

import { MongoClient, ServerApiVersion } 
  from "mongodb";

import {dbURL}  from "./credentials.js";

const client = new MongoClient(dbURL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let result;

const jsonCarInventoryData = fs.readFileSync('cs602_project_car_inventory.json');
const carInventory = JSON.parse(jsonCarInventoryData);
console.log("Read", carInventory.length, "cars");

// Insert Cars
const carsCollection = client.db("cs602_project_car_inventory").collection("cars");
await carsCollection.deleteMany({});
result = await carsCollection.insertMany(carInventory);
console.log('Inserted Ids:', result.insertedIds);


const jsonBrandData = fs.readFileSync('cs602_project_car_brand.json');
const brandData = JSON.parse(jsonBrandData);
console.log("Read", brandData.length, "brands");

// Insert Brands
const brandsCollection = client.db("cs602_project_car_inventory").collection("brands");
await brandsCollection.deleteMany({});
result = await brandsCollection.insertMany(brandData);
console.log('Inserted Ids:', result.insertedIds);

await client.close();
