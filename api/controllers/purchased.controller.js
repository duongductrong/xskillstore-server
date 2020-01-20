const PURCHASED_MODEL = require("../models/purchased.model");
const Notification = require("../modules/Notification");

module.exports.purchaseds = (req, res) => {
    const { purchased_list, onPage, page, total } = res.locals;

    res.json(Notification.message("Lấy dữ liệu thành công", "ok", 200, { purchased: purchased_list, onPage: onPage, page: page, total: total }));
}
module.exports.purchased = (req, res) => {
    const { purchased } = res.locals;

    res.json(Notification.message("Lấy dữ liệu đơn hàng thành công", "ok", 200, { purchased: purchased }));
}
module.exports.create = (req, res) => {
    const { purchased } = res.locals;

    PURCHASED_MODEL.create(purchased).then((result) => {
        if(result) {
            res.json(Notification.message("Gửi đơn hàng thành công", "ok", 200, { purchased: result }));
        }
    }).catch((err) => {
        res.json(Notification.message("Gửi đơn hàng thất bại, vui lòng kiểm tra lại", "error", 400));
    })
}
module.exports.put = (req, res) => {
    const { purchased, id } = res.locals; //Accept
    PURCHASED_MODEL.updateOne({_id: id}, {$set: purchased}, (err, result) => {
        if(err) {
            res.json(Notification.message("Cập nhật không thành công, hãy kiểm tra lại", "error", 400));
            return;
        }

        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Cập nhật đơn hàng thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Đã cập nhật nhưng không có gì thay đổi", "ok", 200));
            }
        }
        else {
            res.json(Notification.message("Không có đơn hàng trùng khớp để cập nhật", "error", 400));
        }
    })
}
module.exports.delete = (req, res) => {
    const { id } = res.locals;

    PURCHASED_MODEL.deleteOne({_id: id}, (err, result) => {
        if(err) {
            res.json(Notification.message("Lỗi ! Không thể xóa đơn hàng", "error", 400));
            return;
        }

        if(result.n >= 1) {
            if(result.deleteCount !== 0) {
                res.json(Notification.message("Xóa đơn hàng thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Đơn hàng chưa được xóa, vui lòng liên hệ admin", "error", 400));
            }
        }
        else {
            res.json(Notification.message("Xóa đơn hàng thất bại, vui lòng kiểm tra lại", "error", 400));
        }
    })
}