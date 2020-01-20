const TAG_MODEL = require("../models/tags.model");

const Notification = require("../modules/Notification");

module.exports.tags = (req, res) => {
    const { tags, total_tags, page, onPage } = res.locals;

    res.json(Notification.message(`Hiện có ${total_tags} thẻ`,"ok", 200, { tags: tags, total_tags: total_tags, page: page, onPage, onPage }));
}
module.exports.tag = (req, res) => {
    const { products, tag, pagination } = res.locals;

    res.json(Notification.message("Đã tìm thấy thẻ thể loại", "ok", 200, {
        products: products,
        tag: tag,
        page: pagination.page,
        onpage: pagination.onPage
    }))
}
module.exports.create = async (req, res) => {
    const { tag } = res.locals;
    const createdTag = await TAG_MODEL.create(tag);

    if(createdTag) {
        res.json(Notification.message("Tạo thẻ thành công","ok",200, { tag: createdTag }));
    }
    else {
        res.json(Notification.message("Có lỗi xảy ra khi khởi tạo thẻ", "error", 200));
    }
}
module.exports.put = async (req, res) => {
    const { tag, url_old } = res.locals;

    const updated = await TAG_MODEL.updateOne({url: url_old}, {$set: tag});

    if(updated.n >= 1) {
        if(updated.nModified >= 1) {
            res.json(Notification.message("Cập nhật thẻ thành công", "ok", 200));
        }
        else {
            res.json(Notification.message("Cập nhật nhưng không có sự thay đổi", "warning", 200));
        }
    }
    else {
        res.json(Notification.message("Không có thẻ trùng khớp để cập nhật", "error", 400));
    }

}
module.exports.delete = async (req, res) => {
    const { tag } = res.locals;

    try {
        let deleted = await TAG_MODEL.deleteOne({_id: tag._id});
        if(deleted.n >= 1) {
            if(deleted.deletedCount >= 1) {
                res.json(Notification.message("Xóa thẻ thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Thẻ trùng khớp nhưng có có vẻ chưa được xóa. Hãy liên hệ administrator","error", 400));
            }
        }
        else {
            res.json(Notification.message("Thẻ này không còn tồn tại để xóa", "error", 400));
        }
    }
    catch(err) {
        res.json(Notification.message("Có lỗi xảy ra, không thể xóa thẻ", "error", 400));
    }
}