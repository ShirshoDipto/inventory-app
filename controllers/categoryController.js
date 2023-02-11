const Category = require("../models/category");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
  Promise.all([Category.countDocuments({}), Item.countDocuments({})])
    .then((results) => {
      res.render("index", {
        title: "Homepage",
        results: results,
      });
    })
    .catch((err) => {
      res.render("index", {
        title: "Homepage",
        err: err,
      });
    });
};

exports.categoryList = (req, res, next) => {
  Category.find({})
    .sort({ name: 1 })
    .exec((err, results) => {
      if (err) {
        return next(err);
      }
      res.render("categoryList", {
        title: "All Categories",
        listCategory: results,
      });
    });
};

exports.createCategoryGet = (req, res, next) => {
  res.render("categoryForm", { 
    title: "Category Form", 
    category: undefined,
    errors: undefined 
  });
};

exports.createCategoryPost = [
  body("categoryName", "Name must not be empty.")
  .trim()
  .isLength({ min: 1 })
  .escape(),

  body("categoryDescription", "Description must not be empty.")
  .trim()
  .isLength({ min: 1 })
  .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    console.log(req.body)

    if (!errors.isEmpty()) {
      res.render("categoryForm", { 
        title: "Category Form", 
        category: undefined,
        errors: errors.array() 
      });
      return;
    }

    const category = new Category({
      name: req.body.categoryName,
      description: req.body.categoryDescription,
    });

    category.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(category.url);
    });
  },
];

exports.categoryDetail = (req, res, next) => {
  Category.findById(req.params.id)
  .populate("items")
  .exec((err, category) => {
    if (err) {
      return next(err);
    }
    if (category === null) {
      const err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
    res.render("categoryDetail", {
      title: "Category Detail",
      category: category,
    });
  });
};

exports.updateCategoryGet = (req, res, next) => {
  Category.findById(req.params.id).exec((err, category) => {
    if (err) {
      return next(err);
    }
    if (category === null) {
      const err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
    res.render("categoryForm", {
      title: "Category Form", 
      category: category,
      errors: undefined 
    });
  });
};

exports.updateCategoryPost = [
  body("categoryName", "Name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body("categoryDescription", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty) {
      res.render("categoryForm", {
        title: "Category Form",
        category: undefined,
        errors: errors.array()
     });
      return;
    }
    async function processCategory() {
      const category = await Category.findById(req.params.id)
      category.name = req.body.categoryName
      category.description = req.body.categoryDescription
      await category.save()
      res.redirect(category.url)
    }

    processCategory().catch(err => {
      return next(err)
    })
  },
];

exports.deleteCategoryGet = (req, res, next) => {
  Category.findById(req.params.id).exec((err, category) => {
    if (err) {
      return next(err);
    }
    if (category === null) {
      const err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
    res.render("deleteCategory", {
      title: "Delete Category",
      category: category,
    });
  });
};

exports.deleteCategoryPost = (req, res, next) => {

  async function deleteCategoryAndItems() {
    const category = await Category.findById(req.params.id)

    for (let itemId of category.items) {
      await Item.findByIdAndRemove(itemId)
    }

    await Category.findByIdAndRemove(req.params.id)
    res.redirect("/categories")
  }
  deleteCategoryAndItems().catch(err => {
    return next(err)
  })
};
