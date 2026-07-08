import {CarQuote} from '../models/CarQuote.js';
import {Car} from '../models/Cars.js';
import {findCarForVinNumber} from "./carDBHelper.js";

async function addCarToQuote(carId, quoteId) {
    console.log("addCarToQuote carId and QuoteId= ",carId,quoteId)
    let result = await CarQuote.findByIdAndUpdate(
        quoteId,
        { $set: {car: carId}},
        {new: true}
    )

    console.log("addCarToQuote",result)
    return result
}
async function addQuoteToCar(carId,quoteId) {
    let result = await Car.findByIdAndUpdate(carId,
        {$addToSet: { quotes: quoteId}},
        {new: true}
        )
    console.log("addQuoteToCar",result)
    return result
}

export  async function createMyRequestForCar(sessionId, vin, email, note) {
    let quote = await CarQuote.create({
        vinNumber: vin,
        note: note,
        email: email,
        sessionId: sessionId,
    })

    let car = await findCarForVinNumber(vin)

    await addCarToQuote(car._id, quote._id)

    await addQuoteToCar(car._id, quote._id)

    return quote
}

export  async function fetchMyRequestsForIds(ids) {
    let result = await CarQuote.find({
        "_id":{
            $in: ids
        }})
    return result
}

export  async function fetchAllCarQuoteRequests() {
    let result = await CarQuote.find()
    return result
}

export async function markQuoteAsReached(quoteId) {
    let update = {
        $set: { reached: true}
    }
    let result = await CarQuote.findByIdAndUpdate(quoteId, update, {new: true})
    console.log("markQuoteAsReached",result)
    return result
}