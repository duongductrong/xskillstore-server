const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    paragraph: { type: String, required: true },
    thumbnail: { type: String, required: true },
    author: { type: String, required: true },
    tags: { type: String, required: true },
    created: { type: Date, default: Date.now() }	
}, { collection: "Article" });

module.exports = mongoose.model("Article", articleSchema);