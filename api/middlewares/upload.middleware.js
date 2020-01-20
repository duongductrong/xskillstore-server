const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");

module.exports.checkFile = (req, res, next) => {
    let file = req.file;
    if(!file) {
        res.json(Notification.message("Không tìm thấy tệp nào được gửi lên", "error", 400));
        return;
    }
    if(file.mimetype !== "image/png" && file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg") {
        res.json(Notification.message("Yêu cầu file tải lên là file ảnh có dạng png, jpg, jpeg", "error", 400));
        return;
    }
    next();
}

module.exports.checkFiles = (req, res, next) => {
    let files = req.files
    if(!files) {
        res.json(Notification.message("Không tìm thấy tệp nào được gửi lên", "error", 400));
        return;
    }
    //Check file from files
    files.forEach(file => {
        if(file.mimetype !== "image/png" && file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg") {
            res.json(Notification.message("Yêu cầu file tải lên là file ảnh có dạng png, jpg, jpeg", "error", 400));
            return;
        }
    })

    next();
}

module.exports.checkDeleteSingle = (req, res, next) => {
    let { file = "" } = req.body;

    if(Checking.isNull(file)) {
        res.json(Notification.message("Không tìm thấy ID ảnh này, vui lòng kiểm tra lại", "error", 404));
        return;
    }
    else {
        res.locals.file = file;
        next();
    }
}

module.exports.checkDeleteMultiple = (req, res, next) => {
    let { files = [] } = req.body;
    // //if element isn't array => [element]
    files !== "" && files !== undefined && !Array.isArray(files) ? files = [files] : files;

    if(!Array.isArray(files)) {
        res.json(Notification.message("Không tìm ID ảnh nào để xóa, vui lòng thêm vào danh sách xóa", "error", 404));
        return;
    }
    else if (Array.isArray(files) && files.length <= 0) {
        res.json(Notification.message("Không tìm ID ảnh nào để xóa, vui lòng thêm vào danh sách xóa", "error", 404));
        return;
    }
    else {
        //next after validate
        res.locals.files = files;
        next();
    }
}