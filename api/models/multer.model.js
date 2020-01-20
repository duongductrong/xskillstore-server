const multer = require("multer");
const path = require("path");
let storage, upload;

storage = multer.diskStorage({
    //Settings destination
    destination: function(req, file, cb) {
        cb(null, "./uploads/");
    },
    //Settings fieldname file
    filename: function(req, file, cb) {
        cb(null, `${file.originalname}`)
    }
});

upload = multer({storage: storage});

module.exports = upload;