const ARTICLE_MODEL = require("../models/articles.model");
const Notification = require("../modules/Notification");
const Pagination = require("../modules/Pagination");

module.exports.articles = (req, res) => {
    let { articles, page, onPage } = res.locals;
    let pagination = Pagination(page, onPage); //Lấy điểm, sô lượng bài viết để phân trang
    let postlength = articles.length; //Tổng số bài viết đã đăng
    //Phân trang để lấy dữ liệu
    articles = articles.slice(pagination.start, pagination.end);

    res.json(Notification.message(
        `Hiện có ${postlength} bài viết`,
        "ok",
        200, 
        {
            articles: articles,
            page: Number(page),
            onPage: Number(onPage),
            total: postlength
        }
    ));
}
module.exports.article = (req, res) => {
    const { article } = res.locals;

    res.json(Notification.message("Đã tìm thấy bài viết", "ok", "error", 200, {
        article: article
    }))
}

module.exports.create = async (req, res) => {
    /* 
        After passed middleware
        @create data
    */
    const { article } = res.locals;
    let articleCreated;
    try {
        articleCreated = await ARTICLE_MODEL.create(article);
    }
    catch(err) {
        res.json(Notification.message("Đăng bài thất bại, có lỗi xảy ra, hãy kiểm tra lại", "error", 400));
        return;
    }

    if(articleCreated) {
        res.json(Notification.message("Đăng bài thành công", "ok", 200, {article: articleCreated}))
    }
}

module.exports.put = async (req, res) => {
    /* 
        Get articles was be update
        +@ handling updated article
        +@ TESTING "Was articles updated from property n (comparability), nModified (change updated)"
        +@ Notification
    */
    const { article } = res.locals;
    let articleUpdated;
    try {
        articleUpdated = await ARTICLE_MODEL.updateOne({_id: article.id}, {$set: article});
        if(articleUpdated.n >= 1) {
            if(articleUpdated.nModified !== 0) {
                res.json(Notification.message("Cập nhật thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Cập nhật thành công, nhưng không có gì thay đổi", "ok", 200));
            }
        }
    }
    catch(err) {
        res.json(Notification.message("Cập nhật thất bại, có lỗi xảy ra", "error", 500));
    }
}

module.exports.delete = async (req, res) => {
    /* 
        Get article from middleware before
        +@ handling deleted
        +@ testing deleted.n(comparability), deletedCount(counter) have a article compare it
        +@ notification for user
    */

    const { article } = res.locals;
    try {
        let deleted = await ARTICLE_MODEL.deleteOne({_id: article._id});

        if(deleted.n >= 1) {
            if(deleted.deletedCount >= 1) {
                res.json(Notification.message("Xóa bài viết thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Bài viết trùng khớp, nhưng có vẽ chưa được xóa", "warning", 200));
            }
        }
        else {
            res.json(Notification.message("Có lỗi xảy ra, không tồn tại bài viết này để xóa", "error", 400));
        }
    }
    catch(err) {
        res.json(Notification.message("Có lỗi xảy ra, không thể xóa bài viết", "error", 400));
    }
}