const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchasedSchema = new Schema({
    products: [{ type: Object, required: true }], //Yêu cầu mua sản phẩm
    user: { type: String, required: true }, //ID người dùng
    verify: { type: Boolean, required: true, default: false }, //xác nhận đơn hơn
    message: { type: String, required: false }, //Tin nhắn
    cancel: { type: Boolean, required: true, default: false }, //Hủy đơn hàng
    price: { type: Number, required: true },
    created: { type: Date, required: false, default: Date.now() },
    promotion: { type: String, required: false }
}, { collection: "Purchased" });

module.exports = mongoose.model("Purchased", purchasedSchema);