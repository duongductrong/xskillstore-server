const express = require("express");
const route = express.Router();

const middleware = require("../middlewares/article.middleware");
const controller = require("../controllers/article.controller");

const userMiddleware = require("../middlewares/user.middleware");

route.get("/", middleware.checkGetAll, controller.articles)
route.get("/:url", middleware.checkGetOne, controller.article)
route.post("/", userMiddleware.checkAuth, userMiddleware.checkIsAdminOrTester, middleware.checkCreate, controller.create);
route.put("/:url", userMiddleware.checkAuth, userMiddleware.checkIsAdminOrTester, middleware.checkPut, controller.put);
route.delete("/:url", userMiddleware.checkAuth, userMiddleware.checkIsAdmin, middleware.checkDelete, controller.delete);

module.exports = route;