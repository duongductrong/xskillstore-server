const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cors = require("cors");
const Axios = require("./api/modules/Axios");
const Notification = require("./api/modules/Notification");
let PROMOTION_MODEL = require("./api/models/promotion.model");

const app = express();
dotenv.config();

//MongoDB
mongoose.connect(process.env.DTB_PRIVATE, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connect Database Successfully");
});

//body parser
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
//Cors
app.use(cors());
//Cookie
app.use(cookieParser())

//Auto delete promotion
setInterval(() => {
    PROMOTION_MODEL.deleteMany({expiry_date: {$lt: Date.now()}}, (err, result) =>{
        console.log(err, result);
    });

  //60 * 60 * 24 * 1000ms = 1 day
}, 60 * 60 * 24 * 1000);

//Route
const MulterUploadRoute = require("./api/routes/MulterUpload");
const userRoute = require("./api/routes/user.route")
const articleRoute = require("./api/routes/article.route");
const tagRoute = require("./api/routes/tag.route");
const promotionRoute = require("./api/routes/promotion.route");
const productRoute = require("./api/routes/product.route");
const purchasedRoute = require("./api/routes/purchased.route");

const userMiddleware = require("./api/middlewares/user.middleware");

app.use("/api/users", userRoute);
app.use("/api/articles", articleRoute);
app.use("/api/tags", tagRoute)
app.use("/api/promotion", promotionRoute)
app.use("/api/products", productRoute);
app.use("/api/purchased", purchasedRoute);

app.get("/api/logined", userMiddleware.checkAuth, (req, res) => {
    res.json(Notification.message("Đã đăng nhập", "ok", 200));
});

app.use("/api/multer", MulterUploadRoute);

module.exports = app;