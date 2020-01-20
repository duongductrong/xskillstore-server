const express = require("express");
const route = express.Router();

const controller = require("../controllers/tag.controller");
const middleware = require("../middlewares/tag.middleware");
const userMiddleware = require("../middlewares/user.middleware");

route.get("/", middleware.checkGetAll, controller.tags);
route.get("/:url", middleware.checkGetOne, controller.tag);
route.post("/", userMiddleware.checkAuth, userMiddleware.checkIsAdminOrTester, middleware.checkCreate, controller.create);
route.put("/:url", userMiddleware.checkAuth, userMiddleware.checkIsAdminOrTester, middleware.checkPut, controller.put);
route.delete("/:url", userMiddleware.checkAuth, userMiddleware.checkIsAdmin, middleware.checkDelete, controller.delete);

module.exports = route;