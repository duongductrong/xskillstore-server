const Notification = require("../modules/Notification");
const Pagination = require("../modules/Pagination");
const Checking = require("../modules/Checking");
const cloudinary = require("../models/Cloudinary.model");

module.exports = {
    getResources: async (req, res) => {
        cloudinary.getResources()
        .then(result => {
            let pagination, resources;
            let { page = 1, onpage = 24 } = req.query;
            //validate page, onpage
            if(!Checking.isPageIsOnPage(page, onpage)) {
                res.json(Notification.message("Page, onPage truyền vào phải là một số", "error", 400));
                return;
            }
            total = result.resources.length;
            pagination = Pagination(page, onpage); //pagination
            resources = result.resources.slice(Number(pagination.start), Number(pagination.end)); //get response resources
            //response json
            res.json(Notification.message("Lấy dữ liệu thành công", "ok", 200, { resources:  resources, page: page, onPage: onpage, total: total}));
        })
        .catch(err => {
            res.json(Notification.message(err, "error", 400));
        })
    },
    uploadSingleFile: async (req, res) => {
        cloudinary.uploadSingle(req.file.path)
        .then(result => {
            res.json(Notification.message("Upload thành công", "ok", 200, { file: result }))
        })
        .catch(err => {
            let { message, http_code } = err;
            res.json(Notification.message(message, "error", http_code));
        })
    },
    uploadMultiFile: async (req, res) => {
        let response_promise = req.files.map(file => new Promise((resolve, reject) => {
            cloudinary.uploadMulpleFile(file.path)
            .then((result) => {
                resolve(result);
            })
            .catch(err => reject(err));
        }))

        Promise.all(response_promise)
        .then(async listImages => {
            res.json(Notification.message("Upload thành công", "ok", 200, {files: listImages}));
        })
        .catch(err => {
            let { message, http_code } = err;
            res.json(Notification.message(message, "error", http_code));
        })
    },
    deleteSingleFile: (req, res) => {
        //get a file
        const { file } = res.locals;
        cloudinary.deleteSingleFile(file)
        .then(response => {
            res.json(Notification.message("Xóa thành công", "ok", 200, { result: response.result }));
        })
        .catch(err => {
            res.json(Notification.message((typeof err === "object" && Checking.isObjEmpty(err)) || err === undefined ? "Có lỗi xảy ra trong quá trình xóa, vui lòng kiểm tra lại hoặc báo quản trị" : err.message, "error", 400));
        })
    },
    deleteMultipleFile: (req, res) => {
        const { files } = res.locals;
        cloudinary.deleteMultipleFile(files)
        .then(response => {
            res.json(Notification.message("Xóa thành công", "ok", 200, { result: response }));
        })
        .catch(err => {
            res.json(Notification.message((typeof err === "object" && Checking.isObjEmpty(err)) || err === undefined ? "Có lỗi xảy ra trong quá trình xóa, vui lòng kiểm tra lại hoặc báo quản trị" : err.message, "error", 400));
        })
    }
}