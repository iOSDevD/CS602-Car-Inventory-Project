/**
 * Mongoose model file pertaining to "carQuotes" collection in database.
 *
 * Each quote can have one-to-one relationship with a car.
 */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const carQuotesSchema = new Schema({
        sessionId: String,
        email: String,
        vinNumber: String,
        note: String,
        reached: {
            type: Boolean,
            default: false
        },
        car:
            {
                    type: Schema.Types.ObjectId,
                    ref: "Car"
            }
    },
    {collection : 'carQuotes'});

export const CarQuote = mongoose.model(
    "CarQuote", carQuotesSchema);