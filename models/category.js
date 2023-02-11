const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {type: String, required: true, maxLength: 200},
    description: {type: String, required: true, maxLength: 1000},
    items: [{type: Schema.Types.ObjectId, ref: "Item"}]
}) 

CategorySchema.virtual("url").get(function() {
    return `/category/${this._id}`
})

module.exports = mongoose.model("Category", CategorySchema)