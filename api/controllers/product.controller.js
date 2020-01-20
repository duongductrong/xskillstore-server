const PRODUCT_MODEL = require("../models/products.model");
const Notification = require("../modules/Notification");

module.exports.products = (req, res) => {
    const { products, found, onPage, page, total, status, size, gender, min_price, max_price } = res.locals;
    res.json(
        Notification.message(`Lấy bài viết thành công`, 
        "ok", 
        200, { 
            products: products, 
            found: found, 
            onPage: onPage, 
            page: page, 
            total: total,
            max_price: max_price,
            min_price: min_price,
            status: status,
            size: size, 
            gender: gender
        }));
}
module.exports.product = (req, res) => {
    const { product } = res.locals;
    res.json(Notification.message("Tìm bài viết thành công", "ok", 200, { product: product }));
}
module.exports.create = (req, res) => {
    const { product } = res.locals;
    PRODUCT_MODEL.create(product).then((result) => {
        res.json(Notification.message("Tạo sản phẩm thành công", "ok", 200, { product: product }));
    }).catch((err) => {
        res.json(Notification.message("Tạo sản phẩm thất bại, hãy kiểm tra lại dữ liệu", "error", 400, { error: err } ))
    })
}
module.exports.put = (req, res) => {
    const { product, url_product } = res.locals;

    PRODUCT_MODEL.updateOne({url: url_product}, product, (err, result) => {
        if(err) {
            res.json(Notification.message("Cập nhật sản phẩm thất bại, hãy thử lại", "error", 400));
            return;
        }

        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Cập nhật sản phẩm thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Cập nhật nhưng không có gì thay đổi", "ok", 200));
            }
        }
        else {
            res.json(Notification.message("Không tồn tại sản phẩm này để cập nhật, hãy kiểm tra lại", "error", 400));
        }
    })
}
module.exports.delete = (req, res) => {
    const { product } = res.locals;
    PRODUCT_MODEL.deleteOne({_id: product._id}, (err, result) => {
        if(err) {
            res.json(Notification.message("Có lỗi xảy ra trong quá trình xóa, hãy thử lại", "error", 400));
            return;
        }
        if(result.n >= 1) {
            if(result.deletedCount !== 0) {
                res.json(Notification.message("Xóa sản phẩm thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Xóa sản phẩm thất bại, hãy thử lại", "error", 400));
            }
        }
        else {
            res.json(Notification.message("Xóa sản phẩm thất bại, hãy thử lại", "error", 400));
        }
    })
}