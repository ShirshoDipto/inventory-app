const Item = require("../models/item");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const fs = require("fs/promises")
const path = require("path")

exports.itemList = (req, res, next) => {
  Item.find({})
    .sort({ name: 1 })
    .exec((err, items) => {
      if (err) {
        return next(err);
      }
      res.render("itemList", {
        title: "All Items",
        items: items
      })
    });
};

exports.createItemGet = (req, res, next) => {
    Category.find({})
    .sort({name: 1})
    .exec((err, categories) => {
        if (err) {
            return next(err)
        }
        res.render("itemForm", {
            title: "Item Form", 
            categories: categories, 
            item: undefined,
            errors: undefined
        })
    })
};

exports.createItemPost = [
    body("itemName", "Name must be specified.")
    .trim()
    .isLength({min: 1})
    .escape(),

    body("itemDescription", "Description must be specified.")
    .trim()
    .isLength({min: 1})
    .escape(),

    body("itemPrice", "Price must be specified.")
    .trim()
    .isInt({min: 1, max: 100000000})
    .escape(),

    body("itemStock", "Number in Stock must be specified.")
    .trim()
    .isInt({min: 1, max: 100000000})
    .escape(),

    (req, res, next) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            Category.find({})
            .sort({name: 1})
            .exec((err, categories) => {
                if (err) {
                    return next(err)
                }
                res.render("itemForm", {
                    title: "Item Form",
                    categories: categories,
                    item: undefined,
                    errors: errors.array()
                })
            })
            return
        }
        let item;
        if (req.file !== undefined) {
            item = new Item({
                name: req.body.itemName,
                description: req.body.itemDescription,
                price: "$" + req.body.itemPrice,
                number_in_stock: req.body.itemStock,
                photo: req.file.filename,
                category: req.body.itemCategory
            })
        } else {
            item = new Item({
                name: req.body.itemName,
                description: req.body.itemDescription,
                price: "$" + req.body.itemPrice,
                number_in_stock: req.body.itemStock,
                category: req.body.itemCategory
            })
        }

        async function updateCategory() {
            await item.save()
            const category = await Category.findById(req.body.itemCategory)
            category.items.push(item._id)
            await category.save()
            res.redirect(item.url)
        }
        updateCategory().catch(err => {
            return next(err)
        })

    }
]

exports.itemDetail = (req, res, next) => {
    Item.findById(req.params.id)
    .populate("category")
    .exec((err, item) => {
        if (err) {
            return next(err)
        }
        if (item === null) {
            const err = new Error("No Item Found")
            err.status = 404
            return next(err)
        }
        res.render("itemDetail", {
            title: "Item Detail",
            item: item
        })
    })
};

exports.updateItemGet = (req, res, next) => {
    Promise.all([
        Item.findById(req.params.id),
        Category.find({}).sort({name: 1})
    ]).then(results => {
        if (results[0] === null) {
            const err = new Error("Item not found")
            err.status = 404
            return next(err)
        }
        res.render("updateItemForm", {
            title: "Item Form",
            item: results[0],
            errors: undefined
        })
    }).catch(err => {
        return next(err)
    })
};

exports.updateItemPost = [
    body("itemName", "Name must be specified.")
    .trim()
    .isLength({min: 1})
    .escape(),

    body("itemDescription", "Description must be specified.")
    .trim()
    .isLength({min: 1})
    .escape()
    .customSanitizer(value => {
        return value.replace("&#x27;", "'")
    }),

    body("itemPrice", "Price must be specified.")
    .trim()
    .isInt({min: 1, max: 100000000})
    .escape(),

    body("itemStock", "Number in Stock must be specified.")
    .trim()
    .isInt({min: 1, max: 100000000})
    .escape(),

    (req, res, next) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            Category.find({})
            .sort({name: 1})
            .exec((err, categories) => {
                if (err) {
                    return next(err)
                }
                res.render("updateItemForm", {
                    title: "Item Form",
                    item: undefined,
                    errors: errors.array()
                })
            })
            return
        }

        async function updateItem() {
            const item = await Item.findById(req.params.id)
            if (req.file !== undefined) {
                if (item.photo !== undefined) {
                    await fs.unlink(path.join(__dirname + `/../public/images/${item.photo}`))
                }
                item.photo = req.file.filename
            }
            item.name = req.body.itemName
            item.description = req.body.itemDescription
            item.price = "$" + req.body.itemPrice
            item.number_in_stock = req.body.itemStock
            await item.save()
            res.redirect(item.url)
        }
        updateItem().catch(err => {
            return next(err)
        })
    }
]

exports.deleteItemGet = (req, res, next) => {
    Item.findById(req.params.id).exec((err, item) => {
        if (err) {
            return next(err)
        }
        res.render("deleteItem", {
            title: "Delete Item",
            item: item
        })
    })
};

exports.deleteItemPost = (req, res, next) => {

  async function deleteItem() {
    const item = await Item.findById(req.params.id)
    const category = await Category.findById(item.category)
    let updatedItems = []
    for (let itemId of category.items) {
        if (itemId.toString() !== req.params.id) {
            updatedItems.push(itemId)
        }
    }
    category.items = updatedItems
    await category.save()
    await Item.findByIdAndRemove(req.params.id)
    if (item.photo !== undefined) {
        await fs.unlink(path.join(__dirname + `/../public/images/${item.photo}`))
    }
    res.redirect(category.url)
  }
  deleteItem().catch(err => {
    return next(err)
  })
};
