const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {type: String, required: true, maxLength: 200},
    description: {type: String, required: true, maxLength: 1000},
    price: {type: String, min: 1, max: 100000000, required: true},
    number_in_stock: {type: String, min: 1, max: 100000000, required: true},
    category: {type: Schema.Types.ObjectId, ref: "Category", required: true}
})

ItemSchema.virtual("url").get(function() {
    return `/item/${this._id}`
})

module.exports = mongoose.model("Item", ItemSchema)
