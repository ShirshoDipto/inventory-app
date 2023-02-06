const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {type: String, required: true, maxLength: 100},
    description: {type: String, required: true, maxLength: 500},
    price: {type: String ,required: true},
    number_in_stock: {type: String, required: true},
    categories: [{type: Schema.Types.ObjectId, ref: "Category", required: true}],
})

ItemSchema.virtual("url").get(function() {
    return `/item/${this._id}`
})

module.exports = mongoose.model("Item", ItemSchema)
