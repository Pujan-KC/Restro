const express = require("express");
const router = express.Router();
const {
  post_add_category,
  categories,
  edit_category,
  post_edit_category,
  items,
  add_items,
  post_add_item,
} = require("../../controller/menu_control");

router.get("/", (req, res) => {
  res.render("admin/admin_menu");
});

router.get("/categories", categories);

router.get("/add-category", async (req, res) => {
  try {
    res.render("admin/admin_add_category", { message: req.flash("message") });
  } catch (error) {
    console.log(error);
  }
});

router.get("/edit-category/:slug", edit_category);

router.post("/add-category", post_add_category);

router.post("/edit-category/:slug", post_edit_category);

router.get("/items", items);

router.get("/add-item", add_items);

router.post("/add-item", post_add_item);

module.exports = router;
