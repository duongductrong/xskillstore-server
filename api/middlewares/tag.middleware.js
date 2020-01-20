const TAG_MODEL = require("../models/tags.model");
const ARTICLE_MODEL = require("../models/articles.model");
const PRODUCT_MODEL = require("../models/products.model")
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");
const Pagination = require("../modules/Pagination");

module.exports.checkGetAll = async (req, res, next) => {
    try {
        let TAGS = await TAG_MODEL.find().sort({_id: "desc"});
        const total = await TAG_MODEL.count();
        const { page = 1, onpage = 9 } = req.query;

        if(Number.isNaN(Number(page)) || Number.isNaN( Number(onpage))) {
            res.json(Notification.message("Trang hoặc số thể loại hiển thị trên trang không chính xác", "error", 400));
            return;
        }

        let pagination = Pagination(page, onpage);

        TAGS = TAGS.slice(pagination.start, pagination.end);

        res.locals.tags = TAGS;
        res.locals.total_tags = total;
        res.locals.page = page;
        res.locals.onPage = onpage;
        next();
    }
    catch(err) {
        res.json(Notification.message("Có lỗi xảy ra khi lấy dữ liệu thẻ", "error", 500));
    }
}
module.exports.checkGetOne = async (req, res, next) => {
    const { url } = req.params;
    // const { size, tags, gender, price } = req.query;
    const { page = 1, onpage = 9 } = req.query;

    if(Number.isNaN(Number(page)) || Number.isNaN( Number(onpage))) {
        res.json(Notification.message("Trang hoặc số bài viết hiển thị trên trang không chính xác", "error", 400));
        return;
    }
    
    let pagination = Pagination(page, onpage);

    const tag = await Checking.isExists(url, TAG_MODEL, "url");

    if(!tag.exists) {
        res.json(Notification.message("Thẻ này không tồn tại", "error", 400));
        return;
    }

    let products = await PRODUCT_MODEL.find()
    .where('_id', tag.data._id)
    .sort({_id: "desc"});

    products = products.slice(pagination.start, pagination.end)

    res.locals = {
        products: products,
        tag: tag.data,
        pagination: pagination
    }
    next();
}


module.exports.checkCreate = async (req, res, next) => {
    let errors = {};
    let { name, url, description } = req.body;
    if(Checking.isNull(name)) {
        errors.name = Notification.message("Tên thẻ không được để trống", "error", 404);
    }

    if(Checking.isNull(url)) {
        errors.url = Notification.message("Đường dẫn thẻ không được để trống", "error", 404);
    }
    else {
        if(Checking.isSpace(url)) {
            errors.url = Notification.message("Đường dẫn thẻ không được tồn tại khoảng cách", "error", 400);
        }
        else {
            if((await Checking.isExists(url, TAG_MODEL, "url")).exists) {
                errors.url = Notification.message("Đường dẫn thẻ này đã tồn tại", "error", 400);
            }
        }
    }

    if(Checking.isNull(description)) {
        description = "";
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }));
        return;
    }

    res.locals.tag = {
        name: name,
        url: url,
        description: description
    }
    next();
}
module.exports.checkPut = async (req, res, next) => {
    let errors = {};
    const url_tag = req.params.url;
    let { name, url, description } = req.body;
    let tag_created = Checking.isExists(url_tag, TAG_MODEL, "url"); //Object
    let tag_new = Checking.isExists(url, TAG_MODEL, "url"); //Object

    if(!(await tag_created).exists) {
        res.json(Notification.message("Thẻ này không tồn tại", "error", 400));
        return;
    }
    
    //Checking request from client
    if(Checking.isNull(name)) {
        errors.name = Notification.message("Tên thẻ không được để trống", "error", 404);
    }

    if((await tag_created).data.url !== url) {
        if(Checking.isNull(url)) {
            errors.url = Notification.message("Đường dẫn thẻ không được để trống", "error", 404);
        }
        else {
            if(Checking.isSpace(url)) {
                errors.url = Notification.message("Đường dẫn thẻ không được tồn tại khoảng cách", "error", 400);
            }
            else {
                if((await tag_new).exists) {
                    errors.url = Notification.message("Đường dẫn thẻ này đã tồn tại", "error", 400);
                }
            }
        }
    } 

    if(Checking.isNull(description)) {
        description = "";
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }));
        return;
    }

    res.locals.tag = {
        name: name,
        url: url,
        description: description
    }
    res.locals.url_old = url_tag;
    next();
}
module.exports.checkDelete = async (req, res, next) => {
    const { url } = req.params;
    const tag = await Checking.isExists(url, TAG_MODEL, "url");
    if(!tag.exists) {
        res.json(Notification.message("Thẻ này không tồn tại", "error", 404));
        return;
    }
    res.locals.tag = tag.data;
    next();
}