const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, maxlength: 50 },
    password: { type: String, required: true},
    address: { type: String, required: false },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: false },
    number_phone: { type: String, required: true, maxlength: 12 },
    permission: { type: String, required: true },
    created: { type: Date, default: Date.now }
}, { collection: "User"});

module.exports = mongoose.model("User", userSchema);