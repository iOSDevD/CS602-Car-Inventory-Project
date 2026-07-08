/**
 * Test Car Module with some simple tests
 */
import * as carInventoryDB from "./carInventoryModule.js"

let result;

// Look up car with VIN Number
result = await carInventoryDB.lookupByVinnumber("XYAJC1231231212012312")
console.log(JSON.stringify(result, null, 2));

// Find all Cars
result = await carInventoryDB.findAllCars()
console.log(JSON.stringify(result, null, 2));

await carInventoryDB.connection.disconnect();