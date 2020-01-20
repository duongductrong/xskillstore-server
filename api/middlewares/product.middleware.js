const PRODUCT_MODEL = require("../models/products.model");
const TAG_MODEL = require("../models/tags.model");
const PROMOTION_MODEL = require("../models/promotion.model");
const USER_MODEL = require("../models/user.model");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");
const Application = require("../modules/Application");
const Pagination = require("../modules/Pagination");

module.exports.AttributeToJSON = async (product) => {
    let tags = Application.ConvertIDToDataJSON(product.tags, TAG_MODEL);
    let author = Application.ConvertIDToDataJSON(product.author, USER_MODEL);
    let promotion = Application.ConvertIDToDataJSON(product.promotion, PROMOTION_MODEL);
    let auth = JSON.parse(await author);

    product.tags = await tags;
    product.promotion = await promotion;
    product.author = await Application.AuthorJSON(auth);
        // product.author = JSON.stringify({
    //     _id: auth._id,
    //     username: auth.username,
    //     firstname: auth.firstname,
    //     lastname: auth.lastname
    // });
    return product;
}

module.exports.checkGetProducts = async (req, res, next) => {
    let { 
        page = 1, 
        onpage = 9,
        gender = "0,1",
        min_price = 0,
        max_price = 999999999,
        size = "",
        status = "0,1",
        tags,
    } = req.query;
    let products;
    let total;
    let conditionQuery = {};
    if(!Checking.isPageIsOnPage(page, onpage)) {
        res.json(Notification.message("Page, onPage truyền vào phải là một số", "error", 400));
        return;
    }
    //Count all product
    total = PRODUCT_MODEL.count();
    //Condition query data 
    conditionQuery.gender = { $in: gender.split(",").map((numb) => Number(numb)) }; //Get gender
    conditionQuery.price = {$gte: Number(min_price), $lte: Number(max_price)}; //get price
    size !== undefined && size !== "" ? conditionQuery.size = { $in: size.split(",").map((sz) => Number(sz)) }: size; //get size
    conditionQuery.status = {$in: status.split(",").map(number => Number(number) >= 1 ? true : false )};
    !Checking.isNull(tags) ? conditionQuery.tags = { $in: tags.split(",") } : tags;
    
    //Testing
    // console.log(conditionQuery);
    // return
    //Pagination
    let pagination = Pagination(page, onpage);
    try {
        products = await PRODUCT_MODEL.find(conditionQuery).sort({_id: "desc"});
    }
    catch(err) {
        res.json(Notification.message("Giá trị query có vẻ không đúng, vui lòng kiểm tra lại", "error", 400));
        return;
    }
    let found = products.length;
    products = products.slice(pagination.start, pagination.end); //Pagination function

    //Convert data JSON
    for(let i = 0; i < products.length; i++) {
        products[i] = await this.AttributeToJSON(products[i]);
    }

    res.locals.products = products;
    res.locals.found = found;
    res.locals.onPage = onpage;
    res.locals.page = page;
    res.locals.total = await total;
    res.locals.gender = gender !== "" ? gender.split(",").map(e=>Number(e)) : gender = [],
    res.locals.size = size !== "" ? size.split(",").map(e=>Number(e)) : size = [],
    res.locals.status = status !== "" ? status.split(",").map(e=>Number(e)) : status = [],
    res.locals.min_price = Number(min_price),
    res.locals.max_price = Number(max_price)
    next();
}
module.exports.checkGetProduct = async (req, res, next) => {
    let product, found = true;
    const { url } = req.params;
    //Try find product by ID
    try {
        product = await PRODUCT_MODEL.findOne({_id: url});
        if(Checking.isNull(product)) {
            found = false
        }
    }
    catch(err) {
        found = false
    }

    //If fail, we can find product by URL
    if(found === false) {
        try {
            product = await PRODUCT_MODEL.findOne({url: url});
        }
        catch(err) {
            res.json(Notification.message("Sản phẩm này không tồn tại", "error", 400));
            return;
        }
    }
    //Check product have exists and passed, if it has
    if(Checking.isNull(product)) {
        res.json(Notification.message("Sản phẩm không tồn tại, vui lòng kiểm tra lại", "error", "404"));
    }
    else {
        product = await this.AttributeToJSON(product);
        res.locals.product = product;
        next();
    }
}
module.exports.checkCreate = async (req, res, next) => {
    let { userLogin } = res.locals;
    let product, checkTags, checkPromotion;
    let errors = {};
    let { 
        title = "", 
        url = "", 
        tags = [], 
        thumbnails = [], 
        images_detail = [], 
        price = "", 
        dropPrice = "", 
        rate = "", 
        description = "", 
        vendor = "", 
        promotion = "", 
        information_production = "", 
        guarantee = "",
        status = "", 
        size = [], 
        gender = "", 
        author = "" } = req.body;
    //First setting
    !Array.isArray(thumbnails) && !Checking.isNull(thumbnails) ? thumbnails = [thumbnails] : thumbnails = thumbnails;
    !Array.isArray(tags) && !Checking.isNull(tags) ? tags = [tags] : tags = tags;
    !Array.isArray(images_detail) && !Checking.isNull(images_detail) ? images_detail = [images_detail] : images_detail = images_detail;
    !Array.isArray(size) && !Checking.isNull(size) ? size = [size] : size = size;

    //In process handling, checking url have a exists before check the first variable
    product = Checking.isExists(url, PRODUCT_MODEL, "url");
    checkPromotion = Checking.isExists(promotion, PROMOTION_MODEL, "_id");

    //Check title
    if(Checking.isNull(title)) {
        errors.title = Notification.message("Tên sản phẩm không được để trống", "error", 404);
    }
    //Check url
    if(Checking.isNull(url)) {
        errors.url = Notification.message("Đường dẫn sản phẩm không được để trống", "error", 404);
    }
    else {
        if(!Checking.isUrl(url)) {
            errors.url = Notification.message("Đường dẫn không được tồn tại khoảng cách, ký tự đặc biệt bị cấm", "error", 400);
        }
        else {
            if((await product).exists) {
                errors.url = Notification.message("Đường dẫn này đã tồn tại", "error", 400);
            }
        }
    }

    //Check tag
    if(Checking.isNull(tags) || tags.length <= 0) {
        errors.tags = Notification.message("Thẻ thể loại sản phẩm không được để trống", "error", 400);
    }
    else {
        checkTags = await Checking.isListExists(tags, TAG_MODEL, "_id");
        if(!checkTags.exists) {
            errors.tags = Notification.message("Danh sách thẻ thể loại có thành phần không tồn tại, vui lòng kiểm tra lại", "error", 400);
        }
    }

    //Check thumbnails
    if(Checking.isNull(thumbnails) || thumbnails.length <= 0) {
        errors.thumbnails = Notification.message("Ảnh Thumbnail sản phẩm không được để trống", "error", 400);
    }
    // else {
    //     if(Array.isArray(thumbnails)) {
    //         if(thumbnails.length > 2) {
    //             errors.thumbnails = Notification.message("Số lượng ảnh thumbnail chỉ cần 1 hoặc 2 ảnh", "error", 400);
    //         }
    //         else {
    //             thumbnails.forEach(thumbnail => {
    //                 if(!Checking.isImage(thumbnail)) {
    //                     errors.thumbnails = Notification.message("Thumbnails có tồn tại file không thuộc file hình ảnh", "error", 400);
    //                 }
    //             });
    //         }
    //     }
    //     else {
    //         errors.thumbnails = Notification.message("Client xử lý lỗi, thumbnails gửi lên phải là một Array", "error", 400);
    //     }
    // }
    //Check images detail
    if(Checking.isNull(images_detail) || images_detail.length <= 0) {
        errors.images_detail = Notification.message("Ảnh chi tiết của sản phẩm không được để trống", "error", 404);
    }
    // else {
    //     if(!Checking.isImages(images_detail)) {
    //         errors.images_detail = Notification.message("Tồn tại FILE ảnh chi tiết sản phẩm không thuộc đuôi ảnh .PNG, .JPG, .GIF", "error", 400);
    //     }
    // }
    //Check price
    if(Checking.isNull(price)) {
        errors.price = Notification.message("Giá tiền sản phẩm không được để trống", "error", 404);
    }
    else {
        if(Number.isNaN(Number(price))) {
            errors.price = Notification.message("Giá tiền phải là kiểu số", "error", 400);
        }
    }
    //Check drop price
    if(!Checking.isNull(dropPrice) && Number.isNaN(Number(dropPrice))) {
        errors.dropPrice = Notification.message("Giá tiền hủy bỏ phải là kiểu số", "error", 400);
    }
    //check description
    if(Checking.isNull(description)) {
        errors.description = Notification.message("Dòng miêu tả sản phẩm không được để trống", "error", 404);
    }
    //check vendor
    if(Checking.isNull(vendor)) {
        errors.vendor = Notification.message("Nhà sản xuất không được để trống", "error", 404);
    }
    //check promotion
    if(!Checking.isNull(promotion)) {
        if(!(await checkPromotion).exists) {
            errors.promotion = Notification.message("Mã khuyến mãi cung cấp cho sản phẩm không tồn tại", "error", 404);
        }
    }
    else {
        promotion = "";
    }
    //check size
    if(Checking.isNull(size) || size.length <= 0) {
        errors.size = Notification.message("Kích cở sản phẩm không được để trống", "error", 404);
    }
    else {
        let passed;
        for(let i = 0; i < size.length ; i++) {
            if(Number.isNaN(Number(size[i])) || (size[i] < 0 || size[i] > 100)) {
                errors.size = Notification.message("Nếu kích cở là số, không được quá 100", "error", 400);
                passed = true;
            }
            if(passed === true) {
                break;
            }
        }
    }
    //check gender
    if(gender === "") {
        errors.gender = Notification.message("Giới tính cho sản phẩm không được để trống", "error", 400);
    }
    else {
        if(Number.isNaN(Number(gender)) && gender.toLowerCase() !== "unisex") {
            errors.gender = Notification.message("Biểu hiện giới tính bằng số 0:Nam, 1:Nữ, hoặc unisex", "error", 400);
        }
        else {
            if(gender < 0 || gender > 1) {
                errors.gender = Notification.message("Biểu hiện giới tính bằng số 0:Nam, 1:Nữ, hoặc unisex");
            }
        }
    }

    !Checking.isNull(status) ? status = status : status = true;
    Checking.isNull(information_production) ? information_production = "" : information_production = information_production;
    Checking.isNull(guarantee) ? guarantee = "" : guarantee = guarantee;
    //Set author
    author = userLogin._id;

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }));
        return;
    }

    res.locals.product = {
        title: title,
        url: url,
        tags: tags,
        thumbnails: thumbnails,
        images_detail: images_detail,
        price: Number(price),
        dropPrice: Number(dropPrice),
        rate: rate,
        description: description,
        vendor: vendor,
        promotion: promotion,
        information_production: information_production,
        guarantee: guarantee,
        status: status,
        size: size,
        gender: gender,
        author: author
    }
    next();
}
module.exports.checkPut = async (req, res, next) => {
    let { userLogin } = res.locals;
    let url_product = req.params.url;
    let product, checkTags, checkPromotion;
    let errors = {};
    let { title, url, tags, thumbnails, images_detail, price, dropPrice, rate, description, vendor, promotion
    , information_production, guarantee, status, size, gender } = req.body;

    //1. Checking product have exists, if it's not, then return;
    //2. Checking permission : if it's admin, then passed, else, checking;
    product = await Checking.isExists(url_product, PRODUCT_MODEL, "url");
    let checkProduct = Checking.isExists(url, PRODUCT_MODEL, "url");
    if(!product.exists) {
        res.json(Notification.message("Sản phẩm này không tồn tại", "error", 404));
        return;
    }
    else {
        if(userLogin.permission !== "admin") {
            if(userLogin._id !== product.data._id) {
                res.json(Notification.message("Người đăng sản phẩm này không thuộc tài khoản bạn", "error", 403));
                return;
            }
        }
    }

    // First setting -> to array
    !Array.isArray(thumbnails) && !Checking.isNull(thumbnails) ? thumbnails = [thumbnails] : thumbnails = thumbnails;
    !Array.isArray(tags) && !Checking.isNull(tags) ? tags = [tags] : tags = tags;
    !Array.isArray(images_detail) && !Checking.isNull(images_detail) ? images_detail = [images_detail] : images_detail = images_detail;
    !Array.isArray(size) && !Checking.isNull(size) ? size = [size] : size = size;

    //In process handling, checking url have a exists before check the first variable
    checkPromotion = Checking.isExists(promotion, PROMOTION_MODEL, "_id");

    //Check title
    if(Checking.isNull(title)) {
        errors.title = Notification.message("Tên sản phẩm không được để trống", "error", 404);
    }
    //Check url
    if(Checking.isNull(url)) {
        errors.url = Notification.message("Đường dẫn sản phẩm không được để trống", "error", 404);
    }
    else {
        if(!Checking.isUrl(url)) {
            errors.url = Notification.message("Đường dẫn không được tồn tại khoảng cách, ký tự đặc biệt bị cấm", "error", 400);
        }
        else {
            if(url !== url_product) {
                if((await checkProduct).exists) {
                    errors.url = Notification.message("Đường dẫn này đã tồn tại", "error", 400);
                }
            }
        }
    }

    //Check tag
    if(Checking.isNull(tags) || tags.length <= 0) {
        errors.tags = Notification.message("Thẻ thể loại sản phẩm không được để trống", "error", 400);
    }
    else {
        checkTags = await Checking.isListExists(tags, TAG_MODEL, "_id");
        if(!checkTags.exists) {
            errors.tags = Notification.message("Danh sách thẻ thể loại có thành phần không tồn tại, vui lòng kiểm tra lại", "error", 400);
        }
    }

    //@Check thumbnails
    //@Temp remove else if conditions validate thumbnails
    //@Validate from cloudinary about image
    if(Checking.isNull(thumbnails) || thumbnails.length <= 0) {
        errors.thumbnails = Notification.message("Ảnh Thumbnail sản phẩm không được để trống", "error", 400);
    }
    // else {
    //     if(Array.isArray(thumbnails)) {
    //         if(thumbnails.length > 2) {
    //             errors.thumbnails = Notification.message("Số lượng ảnh thumbnail chỉ cần 1 hoặc 2 ảnh", "error", 400);
    //         }
    //         else {
    //             thumbnails.forEach(thumbnail => {
    //                 if(!Checking.isImage(thumbnail)) {
    //                     errors.thumbnails = Notification.message("Thumbnails có tồn tại file không thuộc file hình ảnh", "error", 400);
    //                 }
    //             });
    //         }
    //     }
    //     else {
    //         errors.thumbnails = Notification.message("Client xử lý lỗi, thumbnails gửi lên phải là một Array", "error", 400);
    //     }
    // }

    //@Check images detail
    //@Temp remove else if conditions validate image detail
    //@Validate from cloudinary about image
    if(Checking.isNull(images_detail) || images_detail.length <= 0) {
        errors.images_detail = Notification.message("Ảnh chi tiết của sản phẩm không được để trống", "error", 404);
    }
    // else {
    //     if(!Checking.isImages(images_detail)) {
    //         errors.images_detail = Notification.message("Tồn tại FILE ảnh chi tiết sản phẩm không thuộc đuôi ảnh .PNG, .JPG, .GIF", "error", 400);
    //     }
    // }
    
    //Check price
    if(Checking.isNull(price)) {
        errors.price = Notification.message("Giá tiền sản phẩm không được để trống", "error", 404);
    }
    else {
        if(Number.isNaN(Number(price))) {
            errors.price = Notification.message("Giá tiền phải là kiểu số", "error", 400);
        }
    }
    //Check drop price
    if(!Checking.isNull(dropPrice) && Number.isNaN(Number(dropPrice))) {
        errors.dropPrice = Notification.message("Giá tiền hủy bỏ phải là kiểu số", "error", 400);
    }
    //check description
    if(Checking.isNull(description)) {
        errors.description = Notification.message("Dòng miêu tả sản phẩm không được để trống", "error", 404);
    }
    //check vendor
    if(Checking.isNull(vendor)) {
        errors.vendor = Notification.message("Nhà sản xuất không được để trống", "error", 404);
    }
    //check promotion
    if(promotion !== product.data.promotion) {
        if(!Checking.isNull(promotion)) {
            if(!(await checkPromotion).exists) {
                errors.promotion = Notification.message("Mã khuyến mãi cung cấp cho sản phẩm không tồn tại", "error", 404);
            }
        }
        else {
            promotion = "";
        }
    }
    //check size
    if(Checking.isNull(size) || size.length <= 0) {
        errors.size = Notification.message("Kích cở sản phẩm không được để trống", "error", 404);
    }
    else {
        let passed;
        for(let i = 0; i < size.length ; i++) {
            if(Number.isNaN(Number(size[i])) || (size[i] < 0 || size[i] > 100)) {
                errors.size = Notification.message("Nếu kích cở là số, không được quá 100", "error", 400);
                passed = true;
            }
            if(passed === true) {
                break;
            }
        }
    }
    //check gender
    //Gender submit is 0 or 1, if gender === "" => null
    if(gender === "") {
        errors.gender = Notification.message("Giới tính cho sản phẩm không được để trống", "error", 400);
    }
    else {
        if(Number.isNaN(Number(gender)) && gender.toLowerCase() !== "unisex") {
            errors.gender = Notification.message("Biểu hiện giới tính bằng số 0:Nam, 1:Nữ, hoặc unisex", "error", 400);
        }
        else {
            if(gender < 0 || gender > 1) {
                errors.gender = Notification.message("Biểu hiện giới tính bằng số 0:Nam, 1:Nữ, hoặc unisex");
            }
        }
    }

    !Checking.isNull(status) && product.data.status !== status ? status = status : status = product.data.status;
    Checking.isNull(information_production) ? information_production = "" : information_production = information_production;
    Checking.isNull(guarantee) ? guarantee = "" : guarantee = guarantee;
    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }));
        return;
    }

    res.locals.product = {
        _id: product.data._id,
        title: title,
        url: url,
        tags: tags,
        thumbnails: thumbnails,
        images_detail: images_detail,
        price: Number(price),
        dropPrice: Number(dropPrice),
        rate: rate,
        description: description,
        vendor: vendor,
        promotion: promotion,
        information_production: information_production,
        guarantee: guarantee,
        status: status,
        size: size,
        gender: gender
    }
    res.locals.url_product = url_product;
    next();
}
module.exports.checkDelete = async (req, res, next) => {
    const { url } = req.params;

    const product = await Checking.isExists(url, PRODUCT_MODEL, "url");
    if(!product.exists) {
        res.json(Notification.message("Sản phẩm này không tồn tại", "error", 404));
        return;
    }

    res.locals.product = product.data;
    next();
}