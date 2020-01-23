const express = require("express");
const route = express.Router();
const Notification = require("../modules/Notification");
const controller = require("../controllers/user.controller");
const middleware = require("../middlewares/user.middleware");


//list users
route.get("/",  middleware.checkAuth, middleware.checkIsAdminOrTester, middleware.checkGetUsers, controller.users);
//get user
route.get("/:id", 
    middleware.checkAuth, 
    middleware.checkGetUser,
    (req, res, next) => {
        const { userLogin, user } = res.locals;
        if(userLogin.permission !== "admin" && userLogin._id != user._id) {
            res.json(Notification.message("Bạn không có quyền GET dữ liệu của người dùng khác", "error", 400));
            return;
        }
        else {
            next();
        }
    },
    controller.user); //Get a user
//create, signup
route.post("/", middleware.checkCreate, controller.create);
//Update detail person
route.put("/:id", middleware.checkAuth, middleware.checkUpdate, controller.put);
//Reset password
route.patch("/:id", middleware.checkAuth, middleware.checkIsAdmin, middleware.checkResetFromAdmin, controller.resetPasswordFromAdmin);
//Delete user
route.delete("/:id", middleware.checkAuth, middleware.checkIsAdmin, middleware.checkDelete, controller.delete);

route.post("/login", middleware.checkLogin, controller.login); //login

module.exports = route;