const express = require("express");
const route = express.Router();

const middleware = require("../middlewares/product.middleware");
const controller = require("../controllers/product.controller");

const userMiddleware = require("../middlewares/user.middleware");

route.get("/", middleware.checkGetProducts, controller.products);
route.get("/:url", middleware.checkGetProduct, controller.product);
route.post("/", userMiddleware.checkAuth, userMiddleware.checkIsAdminOrTester, middleware.checkCreate, controller.create);
route.put("/:url", userMiddleware.checkAuth, userMiddleware.checkIsAdminOrTester, middleware.checkPut, controller.put);
route.delete("/:url", userMiddleware.checkAuth, userMiddleware.checkIsAdmin, middleware.checkDelete, controller.delete);

module.exports = route;