const PROMOTION_MODEL = require("../models/promotion.model");
const Notification = require("../modules/Notification");

module.exports.promotions = (req, res) => {
    const { promotions, page, onPage, total } = res.locals;
    res.json(Notification.message(
        `Có ${promotions.length} khuyến mãi`, 
        "ok", 
        200, 
        { promotions: promotions, page: page, onPage: onPage, total: total }));
}
module.exports.promotion = (req, res) => {
    const { promotion } = res.locals;
    res.json(Notification.message("Đã lấy được dữ liệu", "ok", 200, { promotion: promotion }));
}
module.exports.create =  async (req, res) => {
    const { promotion } = res.locals;

    const promotionCreated = await PROMOTION_MODEL.create(promotion);
    if(promotionCreated) {
        res.json(Notification.message("Tạo mã khuyến mãi thành công", "ok", 200, { promotion: promotionCreated }));
    }
    else {
        res.json(Notification.message("Có lỗi xảy ra, vui lòng thử lại", "error", 400));
    }
}
module.exports.put = async (req, res) => {
    const { promotion, id } = res.locals;
    let updated;
    try {
        updated = await PROMOTION_MODEL.updateOne({_id: id}, {$set: promotion});
        if(updated) {
            if(updated.n >= 1) {
                if(updated.nModified !== 0) {
                    res.json(Notification.message("Cập nhật thành công", "ok", 200));
                }
                else {
                    res.json(Notification.message("Cập nhật nhưng không có gì thay đổi", "warning", 200));
                }
            }
            else {
                res.json(Notification.message("Cập nhật thất bại, hãy thử lại", "error", 400));
            }
        }
    }
    catch(err) {
        // console.log(err);
        res.json(Notification.message("Có thể bạn đã truyền sai dữ liệu cho phép", "error", 400));
    }
}
module.exports.delete = async (req, res) => {
    const { promotion } = res.locals;
    let deleted;
    try {
        deleted = await PROMOTION_MODEL.deleteOne({_id: promotion._id});
        if(deleted) {
            if(deleted.n >= 1) {
                if(deleted.deletedCount !== 0) {
                    res.json(Notification.message("Xóa thành công", "ok", 200));
                }
                else {
                    res.json(Notification.message("Có lỗi xảy ra, mã khuyến mãi có thể chưa được xóa", "error", 400));
                }
            }
            else {
                res.json(Notification.message("Xóa thất bại, hãy thử lại", "error", 400));
            }
        }
    }
    catch(err) {
        res.json(Notification.message("Xóa thất bại, hãy thử lại", "error", 400));
    }
}