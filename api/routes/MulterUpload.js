const express = require("express");
const route = express.Router();
const multer = require("multer");
const Notification = require("../modules/Notification");
const ControllerUpload = require("../controllers/ControllerUpload");
const MulterModel = require("../models/multer.model");
const uploadMiddleware = require("../middlewares/upload.middleware");
const userMiddleware = require("../middlewares/user.middleware");
//resource upload
route.get("/getResources", userMiddleware.checkAuth, ControllerUpload.getResources);

//Upload single
route.post("/uploadSingle", userMiddleware.checkAuth, (req, res, next) => {
    MulterModel.single("image")(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            res.json(Notification.message("Hãy đảm bảo đúng tên field và tệp gửi lên duy nhất phải là hình ảnh", "error", 400));
        }
        else if (err) {
            res.json(Notification.message("Tệp gửi lên không thể xác định, vui lòng thử lại", "error", 400));
        }
        else {
            next();
        }
    });
}, uploadMiddleware.checkFile, ControllerUpload.uploadSingleFile);

//Upload multi
route.post("/uploadMultiple", userMiddleware.checkAuth, MulterModel.any(), uploadMiddleware.checkFiles, ControllerUpload.uploadMultiFile);


//Delete single
route.post("/deleteSingle", userMiddleware.checkAuth, uploadMiddleware.checkDeleteSingle, ControllerUpload.deleteSingleFile);
//Delete multi
route.post("/deleteMultipleFile", userMiddleware.checkAuth, uploadMiddleware.checkDeleteMultiple, ControllerUpload.deleteMultipleFile)

module.exports = route;