const express = require("express");
const route = express.Router();

const middleware = require("../middlewares/promotion.middleware");
const controller = require("../controllers/promotion.controller");

const userMiddleware = require("../middlewares/user.middleware");

route.get("/", middleware.checkGetAll, controller.promotions);
route.get("/:id", middleware.checkGetOne, controller.promotion);
route.post("/", userMiddleware.checkAuth, userMiddleware.checkIsAdminOrTester, middleware.checkCreate, controller.create);
route.put("/:id", userMiddleware.checkAuth, userMiddleware.checkIsAdminOrTester, middleware.checkPut, controller.put);
route.delete("/:id", userMiddleware.checkAuth, userMiddleware.checkIsAdmin, middleware.checkDelete, controller.delete);

module.exports =  route;