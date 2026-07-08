/**
 * Mongoose model file pertaining to "cars" collection in database.
 *
 * Each car can have one-to-one relationship with a brand.
 * Each car can have one-to-many relationship with quotes. i.e
 * Many quotes can be submitted by the user for the same car.
 */

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const carsSchema = new Schema({
        vinNumber: {
            type: String,
            unique: true,
            required: true
        },
        carName: String,
        year: Number,
        engine: String,
        drive: String,
        category: String,
        price: Number,
        miles: Number,
        exteriorColor: String,
        interiorColor: String,
        mainImage: {
            type: String,
            default: "blankImage.jpg"
        },
        description: String,
        program: String,
        horsePower: Number,
        mileageCity: Number,
        mileageHighway: Number,
        mileageCombined: Number,
        isDeleted: {
            type: Boolean,
            default: false
        },
        brand: {
            type: String,
            ref: "Brand"
        },
        quotes: [
            {
                type: Schema.Types.ObjectId,
                ref: "CarQuote"
            }
        ]
    },
    {collection : 'cars'});

export const Car = mongoose.model(
    "Car", carsSchema);