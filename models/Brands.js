/**
 * Mongoose model file pertaining to "brand" Collection.
 *
 * Each Brand can have many Car's, so this supports one-to-many
 * relationship.
 */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const brandSchema = new Schema({
        _id: String,
        brandName: String,
        vinnumbers: [
            {
                type: String,
                ref: "Car"
            }
        ]
    },
    {collection : 'brands'});

export const Brand = mongoose.model(
    "Brand", brandSchema);