const PROMOTION_MODEL = require("../models/promotion.model");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");
const Application = require("../modules/Application");
const Pagination = require("../modules/Pagination");

module.exports.checkGetAll = async (req, res, next) => {
    let PROMOTION;
    let { page = 1, onpage = 12 } = req.query;
    if(Number.isNaN(Number(page)) || Number.isNaN( Number(onpage))) {
        res.json(Notification.message("Trang hoặc số hiển thị không chính xác", "error", 404));
        return;
    }

    try {
        PROMOTION = await PROMOTION_MODEL.find().sort({_id: "desc"});
        let pagination = Pagination(page, onpage);

        PROMOTION = PROMOTION.slice(pagination.start, pagination.end);
    }
    catch(err) {
        res.json(Notification.message("Có vấn đề khi lấy dữ liệu khuyến mãi", "error", 500));
    }

    res.locals = {
        promotions: PROMOTION,
        page: page,
        onPage: onpage,
        total: await PROMOTION_MODEL.count()
    }
    next();
}
module.exports.checkGetOne = async (req, res, next) => {
    const { id } = req.params;
    let promotion;
    let passed = false;

    try {
        promotion = await PROMOTION_MODEL.findOne({name: id});
        if(promotion) {
            passed = true;
        }
    }
    catch(err) {
        passed = false;
    }

    if(!passed) {
        try {
            promotion = await PROMOTION_MODEL.findById({_id: id});
            if(!promotion) {
                res.json(Notification.message("Mã khuyến mãi này không tồn tại", "error", 404));
                return;
            }
        }
        catch(err) {
            res.json(Notification.message("Mã khuyến mãi này không tồn tại, hãy kiểm tra lại", "error", 404));
            return;
        }
    }

    res.locals = {
        promotion: promotion
    }
    next();
}
module.exports.checkCreate = async (req, res, next) => {
    let date = new Date();
    let dateNow = {
        day: date.getDate(),
        mouth: date.getMonth() + 1,
        year: date.getFullYear()
    }
    let errors = {};
    let { name, percent, expiry_date } = req.body;

    if(Checking.isNull(name)) {
        errors.name = Notification.message("Mã khuyến mãi không được để trống", "error", 404);
    }
    else {
        let promo = await Checking.isExists(name.toUpperCase(), PROMOTION_MODEL, "name");
        if(promo.exists) {
            errors.name = Notification.message("Mã khuyến mãi này đã tồn tại", "error", 400);
        }
    }

    if(Checking.isNull(percent)) {
        errors.percent = Notification.message("Phần trăm khuyến mãi không được để trống", "error", 404);
    }
    else {
        if(Number.isNaN(Number(percent))) {
            errors.percent = Notification.message("Phần trăm khuyến mãi phải là số", "error", 400);
        }
        else {
            if(percent <= 0 || percent > 100) {
                errors.percent = Notification.message("Phần trăm khuyến mãi không nhỏ hơn 0, lớn hơn 100", "error", 400);
            }
        }
    }

    if(Checking.isNull(expiry_date)) {
        errors.expiry_date = Notification.message("Ngày hết hạn không được để trống", "error", 404);
    }
    else {
        let dateSubmit = Application.splitDate(expiry_date);
        if(dateSubmit.year < dateNow.year || (dateSubmit.year >= dateNow.year && dateSubmit.mouth < dateNow.mouth) || (dateSubmit.year >= dateNow.year && dateSubmit.mouth >= dateNow.mouth && dateSubmit.day < dateNow.day + 1)) {
            errors.expiry_date = Notification.message("Ngày hết hạn không được nhỏ hơn ngày hiện tại", "error", 400);   
        }
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }));
        return;
    }

    res.locals = {
        promotion: req.body
    }
    next();
}
module.exports.checkPut = async (req, res, next) => {
    let date = new Date();
    let dateNow = {
        day: date.getDate(),
        mouth: date.getMonth() + 1,
        year: date.getFullYear()
    }
    let errors = {}; //Container error
    const { id } = req.params; //ID code promotion
    let { name, percent, expiry_date, status } = req.body; //Accepted request from client to checking for update

    let promotion_old = Checking.isExists(id, PROMOTION_MODEL, "_id"); //Testing exists of ID
    let promotion_name = Checking.isExists(name.toUpperCase(), PROMOTION_MODEL, "name"); //Testing new name have a exists in database
    if(!(await promotion_old).exists) {
        res.json(Notification.message("Không có mã khuyến mãi này", "error", 400));
        return;
    }
    /* Checking */
    if(Checking.isNull(name)) {
        errors.name = Notification.message("Mã khuyến mãi không được để trống", "error", 404);
    }
    else {
        if((await promotion_old).data.name !== name.toUpperCase()) {
            if((await promotion_name).exists) {
                errors.name = Notification.message("Mã khuyến mãi này đã tồn tại", "error", 400);
            }
        }
    }

    if(Checking.isNull(percent)) {
        errors.percent = Notification.message("Phần trăm khuyến mãi không được để trống", "error", 404);
    }
    else {
        if(Number.isNaN(Number(percent))) {
            errors.percent = Notification.message("Phần trăm khuyến mãi phải là số", "error", 400);
        }
        else {
            if(percent <= 0 || percent > 100) {
                errors.percent = Notification.message("Phần trăm khuyến mãi không nhỏ hơn 0, lớn hơn 100", "error", 400);
            }
        }
    }

    if(Checking.isNull(expiry_date)) {
        errors.expiry_date = Notification.message("Ngày hết hạn không được để trống", "error", 404);
    }
    else {
        let dateSubmit = Application.splitDate(expiry_date);
        if(dateSubmit.year < dateNow.year || (dateSubmit.year >= dateNow.year && dateSubmit.mouth < dateNow.mouth) || (dateSubmit.year >= dateNow.year && dateSubmit.mouth >= dateNow.mouth && dateSubmit.day < dateNow.day + 1)) {
            errors.expiry_date = Notification.message("Ngày hết hạn không được nhỏ hơn ngày hiện tại", "error", 400);   
        }
    }

    if(!Checking.isNull(status) && typeof status !== "boolean") {
        if(status !== false || status !== true) {
            errors.status = Notification.message("Trạng thái chỉ có tắt(false) hoặc mở(true)", "error", 400);
        }
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }));
        return;
    }
    res.locals = {
        promotion: req.body,
        id: id
    }
    next();
}
module.exports.checkDelete = async (req, res, next) => {
    const { id } = req.params;

    let promotion = await Checking.isExists(id, PROMOTION_MODEL, "_id");
    if(!promotion.exists) {
        res.json(Notification.message("Mã khuyến mãi này không tồn tại", "error", 400));
        return;
    }
    res.locals = {
        promotion: promotion.data
    }
    next();
}