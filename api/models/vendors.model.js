const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vendorSchema = new Schema({
    name: { type: String, required: true }, //Tên nhà sản xuất
    url: { type: String, required: true } //Đường dẫn liên kết đến nhà sản xuất
}, { collection: "Vendor" });

module.exports = mongoose.model("Vendor", vendorSchema);