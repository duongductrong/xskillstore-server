const PURCHASED_MODEL = require("../models/purchased.model");
const PRODUCT_MODEL = require("../models/products.model");
const PROMOTION_MODEL = require("../models/promotion.model");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");
const Application = require("../modules/Application");
const Pagination = require("../modules/Pagination");

//Checking errors purchased
function isProductCorrect(products) {
    //Check id product
    //check amount product
    //check price product

    // PRODUCTS = JSON Data => PARSE OBJECT => OBJECT
    try {
        for(let i = 0; i < products.length; i++) {
            // products[i] = JSON.parse(products[i]);

            if(Checking.isNull(products[i].id_product) 
            || Checking.isNull(products[i].amount) 
            || Checking.isNull(products[i].price)
            || products[i].amount < 0 
            || products[i].price < 0) {
                return false;
            }
            else {
            }
        }
        return true;
    }
    catch(err) {
        return false;
    }
}

module.exports.checkGetParchaseds = async (req, res, next) => {
    let { 
        page = 1, 
        onpage = 9, 
        verify, 
        cancel,
        sort = "desc"
    } = req.query;
    let condition = {};
    verify = verify == "true" ? true : false;
    cancel = cancel == "true" ? true : false
    //Conditions
    !Checking.isNull(verify) ? condition.verify = verify : condition;
    !Checking.isNull(cancel) ? condition.cancel = cancel : condition;

    if(!Checking.compare(sort, "desc") && !Checking.compare(sort, "asc")) {
        res.json(Notification.message("_sort params phải là desc hoặc asc", "error", 400));
        return;
    }

    let purchased_list = await PURCHASED_MODEL.find(condition).sort({_id: sort});
    const pagination = Pagination(page, onpage);

    //Pagination
    purchased_list = purchased_list.slice(pagination.start, pagination.end);

    //Convert data from ID
    for(let i = 0; i < purchased_list.length; i++) {
        purchased_list[i].user = await Application.AuthorJSON(purchased_list[i].user);
    }

    res.locals = {
        purchased_list: purchased_list,
        onPage: onpage,
        page: page,
        total: await PURCHASED_MODEL.count()
    }
    next();
}
module.exports.checkGetParchased = async (req, res, next) => {
    const { id } = req.params;
    let purchased;
    try {
        purchased = await Checking.isExists(id, PURCHASED_MODEL, "_id");

        if(!purchased.exists) {
            res.json(Notification.message("Đơn hàng không tồn tại, vui lòng kiểm tra lại", "error", 404));
            return;
        }
        purchased.data.user = await Application.AuthorJSON(purchased.data.user);
        res.locals.purchased = purchased.data;
        next();
    }
    catch(err) {
        res.json(Notification.message("Đơn hàng không tồn tại, vui lòng kiểm tra lại", "error", 404));
    }
}

module.exports.checkCreate = async (req, res, next) => {
    let { userLogin } = res.locals;
    let errors = {};
    let { products, 
        user, 
        verify, 
        message, 
        cancel, 
        price, 
        promotion } = req.body;
    let total_money = 0;
    let transportFee = 20000;
    
    user = userLogin._id; //ID người dùng
    verify = false; //Xác nhận đơn hơn (chưa xác nhận)
    cancel = false //Trang thái hủy đơn hàng (không hủy)

    //Handling products
    !Array.isArray(products) ? products = [products] : products = products;

    //Convert product to object data
    typeof products === "string" ? products = products.map(product => JSON.parse(product)) : products;

    //Total money
    total_money = products.reduce((productSum, nextProduct) => {
        return productSum + (nextProduct.price * nextProduct.amount);
    }, 0);

    if(Checking.isNull(products) || products.length < 0) {
        errors.products = Notification.message("Sản phẩm không được để trống, khi mua phải bao gồm sản phẩm được mua", "error", 404);
    }
    else {
        if(!isProductCorrect(products)) {
            errors.products = Notification.message("Biểu mẫu sản phẩm gửi lên không chính xác, vui lòng không chỉnh sửa thông tin. Đảm bảo số lượng, giá tiền không nhỏ hơn 0", "error", 404);
        }
        else {
            //get ID
            let id_products = products.map(product => {
                return product.id_product
            })
            //Check id of product have exists
            let checkProduct = await Checking.isListExists(id_products, PRODUCT_MODEL, "_id");
            if(!checkProduct.exists) {
                errors.products = Notification.message("Một trong số các mã hàng hóa này hiện không còn tồn tại, vui lòng thử lại", "error", 400);
            }
        }
    }

    if(!Checking.isNull(promotion)) {
        promotion = await Checking.isExists(promotion, PROMOTION_MODEL, "name"); //Get promotion data, exists
        if(promotion.exists) {
            total_money = Application.CaltheProPrice(total_money, promotion.data.percent, transportFee);
            promotion = JSON.stringify(promotion.data);
        }
        else {
            errors.promotion = Notification.message("Mã khuyến mãi này không tồn tại", "error", 404);
        }
    }
    else {
        promotion = "";
        total_money = Application.CaltheProPrice(total_money, 0, transportFee)
    }
    if(Checking.isNull(price) && price !== 0) {
        errors.price = Notification.message("Tổng tiền sản phẩm không được để trống", "error", 404);
    }
    else {
        if(Number.isNaN(Number(price))) {
            errors.price = Notification.message("Tổng tiền sản phẩm phải là số", "error", 400);
        }
        else {
            price = Number(price);
            if(price < 0) {
                errors.price = Notification.message("Tổng tiền sản phẩm không bao giờ nhỏ hơn 0", "error", 400);
            }
            else {
                if(price !== total_money) {
                    errors.price = Notification.message("Sai lệch phí thanh toán, vui lòng báo ngay admin 0328983087")
                }
            }
        }
    }

    if(Checking.isNull(message)) {
        message = "";
    }
    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra, vui lòng kiểm tra lại", "error", 400, { errors: errors }));
        return;
    }

    res.locals.purchased = { 
        products: products,
        user: user,
        verify: verify,
        message: message,
        cancel: cancel,
        price: total_money,
        promotion: promotion
    }
    next();
}

module.exports.theOrder = (req, res, next) => {
    const { purchased } = res.locals;
}

module.exports.checkPut = async (req, res, next) => {
    let { id } = req.params;
    let { userLogin } = res.locals;
    let {
        verify, 
        cancel
    } = req.body;
    let total_money = 0;
    let transportFee = 20000;

    if(Checking.isNull(id)) {
        res.json(Notification.message("Vui lòng điền mã đơn hàng", "error", 404));
        return;
    }
    else {
        let purchase = await Checking.isExists(id, PURCHASED_MODEL, "_id");
        if(!purchase.exists) {
            res.json(Notification.message("Đơn hàng này không tồn tại", "error", 404));
        }
    }

    user = userLogin._id; //ID người dùng
    verify = verify; //Xác nhận đơn hơn (chưa xác nhận)
    cancel = cancel //Trang thái hủy đơn hàng (không hủy)
    if(verify == "true" || verify === true) {
        verify = true;
        cancel = false;
    }
    else {
        if(cancel == "true" || cancel === true) {
            verify = false;
            cancel = true;
        }
        else {
            verify = false;
            cancel = false;
            //maybe need notice for admin manager
        }
    }

    res.locals.purchased = { 
        verify: verify,
        cancel: cancel
    }
    res.locals.id = id;
    next();
}
module.exports.checkDelete = async (req, res, next) => {
    const { id } = req.params;

    const purchased = await Checking.isExists(id, PURCHASED_MODEL, "_id");

    if(!purchased.exists) {
        res.json(Notification.message("Đơn hàng này không tồn tại, vui lòng thử lại", "error", 404));
        return;
    }

    res.locals.id = id;
    next();
}