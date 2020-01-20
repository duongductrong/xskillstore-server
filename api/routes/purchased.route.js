const express = require("express");
const route = express.Router();

const middleware = require("../middlewares/purchased.middleware");
const controller = require("../controllers/purchased.controller");

const userMiddleware = require("../middlewares/user.middleware");

route.get("/", userMiddleware.checkAuth, userMiddleware.checkIsAdminOrTester, middleware.checkGetParchaseds, controller.purchaseds);
route.get("/:id", middleware.checkGetParchased, controller.purchased);
route.post("/", userMiddleware.checkAuth, middleware.checkCreate, controller.create);
route.put("/:id", userMiddleware.checkAuth, userMiddleware.checkIsAdminOrTester, middleware.checkPut, controller.put);
route.delete("/:id", userMiddleware.checkAuth, userMiddleware.checkIsAdmin, middleware.checkDelete, controller.delete);


module.exports = route;