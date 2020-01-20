const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema({
    name: { type: String, required: true },
    url: { type :String, required: true },
    description: { type: String, required: false }
}, { collection: "Tag" });

module.exports = mongoose.model("Tag", tagSchema);