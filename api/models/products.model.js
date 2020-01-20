const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: { type: String, required: true }, //Tiêu đề sản phẩm
    url: { type: String, required: true }, //Đường dẫn sản phẩm
    tags: [ { type: String, required: true } ], //loại sản phẩm
    thumbnails: [ { type: String, required: true}] , //Ảnh thumbnails [1 || 2]
    images_detail: [ { type: String, required: true } ], //Ảnh chi tiết sản phẩm
    price: { type: Number, required: true }, //Giá chính
    dropPrice: { type: Number, required: false }, //Giá remove
    rate: { type: Number, required: false }, //Đánh giá sản phẩm
    description: { type: String, required: true }, //Miêu tả sản phẩm
    vendor: { type: String, required: true }, //Nhà sản xuất sản phẩm
    created: { type: Date, required: true, default: Date.now() }, //Ngày xuất sản phẩm
    promotion: { type: String, required: false }, //Thông tin khuyến mãi
    information_production: { type: String, required: false }, //Thông tin sản phẩm
    guarantee: { type: String, required: false }, //Thông tin bảo hành
    status: { type: Boolean, required: true, default: true }, //Trạng thái sản phẩm còn hoặc hết
    size: [ { type: Number || String, required: true } ], //Kích cở sảnf phẩm
    gender: { type: Number || String, required: true }, // Giới tính nam => return true || false
    author: { type: String, required: true }
}, { collection: "Product" });

module.exports = mongoose.model("Product", productSchema);