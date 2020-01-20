const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const promotionSchema = new Schema({
    name: { type: String, required: true }, //Tên mã khuyến mãi
    percent: { type: Number, max: 100, required: true }, //Số phần trăm khuyến mãi
    expiry_date: { type: Date, required: true, min: '2019-01-01', max: '2100-01-01' }, //Hạn hết hạn mã giảm giá
    status: { type: Boolean, required: true, default: true }
}, { collection: "Promotion" });

module.exports = mongoose.model("Promotion", promotionSchema);