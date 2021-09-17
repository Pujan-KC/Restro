const express = require("express");
const router = express.Router();
const {
  menu,

  categories,
  add_category,
  post_add_category,
  edit_category,
  post_edit_category,
  items,
  add_items,
  post_add_item,
  edit_item,
  post_edit_item,
  edit_item_linked,
} = require("../../controller/menu_control");

router.get("/", menu);

router.get("/categories", categories);

router.get("/add-category", add_category);
router.get("/edit-category/:slug", edit_category);

router.post("/add-category", post_add_category);

router.post("/edit-category/:slug", post_edit_category);

router.get("/items", items);

router.get("/add-item", add_items);

router.post("/add-item", post_add_item);

router.get("/edit-item/:slug", edit_item);

router.post("/item-update/:slug", post_edit_item);

//Deleting image or category linked to item
router.get("/edit-item-linked/:name/:slug", edit_item_linked);

module.exports = router;
