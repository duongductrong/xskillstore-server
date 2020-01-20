const express = require("express");
const route = express.Router();

const controller = require("../controllers/user.controller");
const middleware = require("../middlewares/user.middleware");


route.get("/",  middleware.checkAuth, middleware.checkIsAdminOrTester, middleware.checkGetUsers, controller.users);
route.get("/:id", middleware.checkGetUser, controller.user);
route.post("/", middleware.checkCreate, controller.create);
route.put("/:id", middleware.checkAuth, middleware.checkUpdate, controller.put);
route.patch("/:id", middleware.checkAuth, middleware.checkIsAdmin, middleware.checkResetFromAdmin, controller.resetPasswordFromAdmin);
route.delete("/:id", middleware.checkAuth, middleware.checkIsAdmin, middleware.checkDelete, controller.delete);

route.post("/login", middleware.checkLogin, controller.login);

module.exports = route;