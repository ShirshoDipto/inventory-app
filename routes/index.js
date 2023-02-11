var express = require("express");
var router = express.Router();

const categoryController = require("../controllers/categoryController");
const itemController = require("../controllers/itemController");

/* GET home page. */
router.get("/", categoryController.index);

/* Category related routes. */
router.get("/categories", categoryController.categoryList);

router.get("/category/create", categoryController.createCategoryGet);

router.post("/category/create", categoryController.createCategoryPost);

router.get("/category/:id", categoryController.categoryDetail);

router.get("/category/:id/delete", categoryController.deleteCategoryGet);

router.post("/category/:id/delete", categoryController.deleteCategoryPost);

router.get("/category/:id/update", categoryController.updateCategoryGet);

router.post("/category/:id/update", categoryController.updateCategoryPost);

// ALL ITEM RELATED Routes
router.get("/items", itemController.itemList);

router.get("/item/create", itemController.createItemGet);

router.post("/item/create", itemController.createItemPost);

router.get("/item/:id", itemController.itemDetail);

router.get("/item/:id/delete", itemController.deleteItemGet);

router.post("/item/:id/delete", itemController.deleteItemPost);

router.get("/item/:id/update", itemController.updateItemGet);

router.post("/item/:id/update", itemController.updateItemPost);

module.exports = router;
