// const USER_MODEL = require("../models/user.model");
// const PRODUCT_MODEL = require("../models/products.model");
// const VENDOR_MODEL = require("../models/vendors.model");
// const TAG_MODEL = require("../models/tags.model");
// const PURCHASED_MODEL = require("../models/purchased.model");
// const PERMISSION_MODEL = require("../models/permission.model");
// const ARTICLE_MODEL = require("../models/articles.model");
// const PROMOTION_MODEL = require("../models/promotion.model");
const axios = require("axios");

module.exports.isNull = (key) => {
    if(!key) {
        return true;
    }
    return false
}

module.exports.isObjEmpty = (obj) => {
    for(let e in obj) {
        if(obj.hasOwnProperty(e)) {
            return false;
        }
    }
    return true;
}

/* For user
    + isPassword, isEmail, isNumberPhone, permiss
*/
module.exports.isPassword = (password) => {
    const validatePass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/g;
    return validatePass.test(password);
}
module.exports.isEmail = (email) => {
    let validateEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
    return validateEmail.test(email);
}
module.exports.isNumberPhone = (number_phone) => {
    let validateNbp = /^[0-9]{0,12}$/g;
    return validateNbp.test(number_phone);
}
module.exports.isExists = async (key, model, spec) => {
    let condition = JSON.parse(`{"${spec}": "${key}"}`);
    try {
        const data = await model.findOne(condition);
        //Tồn tại giá trị data return true || return false
        return data ? {data: data, exists: true} : {data: {}, exists: false}
        // return data ? true : false
    }
    catch(err) {
        //Gặp lỗi tìm kiếm data => không tồn tại
        return {data: {}, exists: false};
    }
}

module.exports.isListExists = async (keys, model, field) => {
    let condition;
    let data;
    let result = [];
    //Checking all key have exists in model
    for(let i = 0; i < keys.length; i++) {
        condition = JSON.parse(`{"${field}" : "${keys[i]}"}`);
        try {  
            data = await model.findOne(condition);
        }
        catch(err) {
            console.log(err);
            return { data: [], exists: false }
        }

        if(this.isNull(data)) {
            return { data: [], exists: false }
        }
        else {
            result.push(data);
        }
    }

    if(result.length !== keys.length) {
        return { data: [], exists: false }
    }
    else {
        return { data: result, exists: true };
    }
}

//kiểm tra lỗi tồn tại
module.exports.testError = (errors) => {
    let counter = 0;
    for(let key in errors) {
        counter++;
    }
    return counter > 0 ? true : false
}
//compare testing
module.exports.compare = (val_new, val_old) => {
    return val_new === val_old;
}
//Kiểm tra phân quyền
module.exports.permiss = (permission, userPosition) => {
    return permission === userPosition;
}
//Kiểm tra đường dẫn hình ảnh
module.exports.isImage = (image) => {
    /* checking with jpg or png */
    // return /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g.test(image);
    return true;
}
module.exports.isImages = (images) => {
    let i, length;
    length = images.length;
    for(let i = 0; i < length; i++) {
        if(!this.isImage(images[i])) {
            return false;
        }
    }
    return true;
}

//Kiểm tra khoảng trống
module.exports.isSpace = (url) => {
    //Kiểm tra khoảng trống
    let test = url.split(" ");
    return test.length > 1 ? true : false;
}

module.exports.isUrl = (url) => {
    return /^(?![!@#\$%\^&\*()\[\]\.\/\;\'\:"\"'])*([a-z\d]*\–*\-*[a-z\d]*)*$/g.test(url);
}

module.exports.updateAllowed = (user, model) => {
    //@model should be get on middleware before add to checking permission
    try {
        //Nếu không phải admin, kiểm tra id
        if(user.permission !== "admin") {
            if(this.compare(user._id, model.author)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            //Nếu là admin, cho phép
            return true;
        }
    }
    catch(err) {
        console.error(err);
        return false;
    }
}

module.exports.isPageIsOnPage = (page, onPage) => {
    if(Number.isNaN(Number(page)) || Number.isNaN(Number(onPage))) {
        return false;
    }
    return true;
}