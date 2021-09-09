const CatModel = require("../models/cat_model");
const ItemModel = require("../models/item_model");
const fs = require("fs-extra");
const item_model = require("../models/item_model");

//category index
const categories = async (req, res) => {
  try {
    const categories = await CatModel.find();
    res.render("admin/admin_categories", {
      message: req.flash("message"),
      categories: categories,
    });
  } catch (error) {
    console.log(error);
  }
};

//Adding new category
const post_add_category = async (req, res) => {
  try {
    req.body.tittle = req.body.tittle.trim();
    //if tittle is not empty
    if (req.body.tittle != "") {
      req.body.slug = req.body.tittle.replace(/\s+/g, "-").toLowerCase();
      const check = await CatModel.findOne({ tittle: req.body.tittle });
      //if tittle
      if (check) {
        return res.render("admin/admin_add_category", {
          message: "Tittle Already Exists",
          tittle: req.body.tittle,
        });
      }
      //if unique tittle
      else {
        var newCat = CatModel(req.body);
        tittle = newCat.tittle;
        if (req.files) {
          const { image } = req.files;
          const type = image.mimetype.split("/");
          //if image is valid
          if (type.includes("image")) {
            newCat.image = tittle + "." + type[1];
            image.mv("public/images/cat_images/" + newCat.image, (err) => {
              if (err) {
                console.log(err);
              }
            });
          }
          //if image is invalid
          else {
            req.flash("message", "please upload valid image file");
            res.redirect("back");
          }
        }
        await newCat.save();
        req.flash("message", "Category added successfully");
        return res.redirect("/admin/menu/categories");
      }
    }
    //If tittle is empty
    else {
      req.flash("message", "Tittle field cannot be empty");
      res.redirect("back");
    }
  } catch (error) {
    console.log(error);
  }
};
//editing category
const edit_category = async (req, res) => {
  try {
    var message = "";
    const { slug } = req.params;
    const { action } = req.query;
    const category = await CatModel.findOne({ slug });

    switch (action) {
      case "hide":
        await CatModel.updateOne({ slug }, { $set: { show: false } });
        message = ` ${category.tittle} Hidden `;
        break;
      case "show":
        await CatModel.updateOne({ slug }, { $set: { show: true } });
        message = ` ${category.tittle} Shown `;
        break;
      case "delete":
        await CatModel.deleteOne({ slug });
        message = ` ${category.tittle} Deleted `;
        if (category.image != "noimage.png") {
          fs.remove(`public/images/cat_images/${category.image}`, (err) => {
            if (err) console.log(err);
          });
        }
        break;
      case "edit":
        return res.render("admin/admin_edit_category", {
          category: category,
          message: req.flash("message"),
        });
        break;

      default:
        message = "Unauthorized Action";
        break;
    }
    req.flash("message", message);
    res.redirect("back");
  } catch (error) {
    console.log(error);
  }
};
//post edit category
const post_edit_category = async (req, res) => {
  try {
    const { slug } = req.params;
    const oldCat = await CatModel.findOne({ slug });
    const tittle = req.body.tittle.trim();
    req.body.tittle = tittle;

    //if tittle is not empty
    if (tittle != "") {
      //if image is updated
      if (req.files) {
        const { image } = req.files;
        const type = image.mimetype.split("/");

        //if image is valid
        if (type.includes("image")) {
          req.body.image = tittle + "." + type[1];

          //if previous image exists remove image
          if (oldCat.image != "noimage.png") {
            console.log("here");
            fs.remove(`public/images/cat_images/${oldCat.image}`, (err) => {
              if (err) console.log(err);
            });
          }
          image.mv("public/images/cat_images/" + req.body.image, (err) => {
            if (err) console.log(err);
          });
        }
        //if image is invalid
        else {
          req.flash("message", "Please Provide Valid Image File");
          return res.redirect("back");
        }
      }
      await CatModel.updateOne({ slug }, { $set: req.body });
      req.flash("message", "Category Updated Successfully");
      res.redirect("/admin/menu/categories");
    }
    //if tittle is empty
    else {
      req.flash("message", "Tittle Field Cannot be empty");
      return res.redirect("back");
    }
  } catch (error) {
    console.log(error);
  }
};
//items index
const items = async (req, res) => {
  try {
    const items = await ItemModel.find();
    res.render("admin/admin_items", {
      items: items,
      message: req.flash("message"),
    });
  } catch (error) {
    console.log(error);
  }
};
//get add items
const add_items = async (req, res) => {
  try {
    const categories = await CatModel.find();
    res.render("admin/admin_add_item", {
      message: req.flash("message"),
      tittle: "Add Item",
      categories: categories,
    });
  } catch (error) {
    console.log(error);
  }
};
//Post add item
const post_add_item = async (req, res) => {
  try {
    const categories = await CatModel.find();
    const { name, price, category } = req.body;
    var not_valid = (fault) => {
      return res.render("admin/admin_add_item", {
        message: fault,
        categories: categories,
        name: name,
        price: price,
      });
    };
    //If all inputs are filled
    if (name && price && category) {
      req.body.name = req.body.name.trim();
      const ab = new ItemModel(req.body);
      console.log(req.body.name);

      ab.slug = ab.name.replace(/\s+/g, "-").toLowerCase();
      console.log(ab.slug);

      const check = await ItemModel.findOne({ slug: ab.slug });

      //if item already exists
      if (check) {
        not_valid("Item already Exists");
      }
      fs.mkdirpSync(`public/images/product_images/${ab.slug}`);
      //if image is uploaded
      if (req.files) {
        const { image } = req.files;
        const info = image.mimetype.split("/");
        //if image is valid
        if (info.includes("image")) {
          ab.image = ab.slug + "." + info[1];
          //move image to directory
          image.mv(
            `public/images/product_images/${ab.slug}/${ab.image}`,
            (err) => {
              if (err) console.log(err);
            }
          );
        }
        //if image is invalid
        else {
          not_valid("Please Provide An Image File");
        }
      } else {
        ab.image = "noimage.png";
      }

      await ab.save();
      req.flash("message", "Item Added Successfully");
      return res.redirect("/admin/menu/items");
    }
    //if All the input field are not filled
    else {
      not_valid("Please Provide All input Fields");
    }
  } catch (error) {
    //Catch error
    console.log(error);
  }
};
//get edit item
const edit_item = async (req, res) => {
  try {
    const { slug } = req.params;
    const { action } = req.query;
    const item = await ItemModel.findOne({ slug });
    var { name, image, show, price, category } = item;
    const categories = await CatModel.find();
    const db_category = await CatModel.find({ slug: item.category });

    for (i = 0; i < image.length; i++) {
      console.log("hello");
      image[i] = (slug + "/").concat(image[i]);
    }
    db_category.linker = slug;
    console.log(image);

    var message = "";

    switch (action) {
      case "hide":
        await ItemModel.updateOne({ slug }, { $set: { show: false } });
        message = `${item.name} Shown`;
        break;
      case "show":
        await ItemModel.updateOne({ slug }, { $set: { show: true } });
        message = `${item.name} Hidden`;
        break;
      case "edit":
        return res.render("admin/admin_edit_item", {
          name: name,
          image: image,
          show: show,
          price: price,
          slug: slug,
          categories: categories,
          dbcategory: db_category,
          linker: slug,
        });
        break;
      case "delete":
        await ItemModel.deleteOne({ slug });
        message = "Item Deleted";
        break;
      default:
        message = "Unauthorized action";
        break;
    }
    req.flash("message", message);
    res.redirect("back");
    console.log(message);
  } catch (error) {
    console.log(error);
  }
};
//exporting functions
module.exports = {
  post_add_category,
  categories,
  edit_category,
  post_edit_category,
  items,
  add_items,
  post_add_item,
  edit_item,
};
