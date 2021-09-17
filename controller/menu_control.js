const CatModel = require("../models/cat_model");
const ItemModel = require("../models/item_model");
const fs = require("fs-extra");

//menu index
const menu = async (req, res) => {
  try {
    const categories = await CatModel.find().sort({ tittle: 1 });
    var menu = [];
    //for every category
    for (var i = 0; i < categories.length; i++) {
      //finding item realted to category[i]
      const item = await ItemModel.find({ category: categories[i].slug });
      var { tittle } = categories[i];
      var monu = {}; //Object to hold category and its child items
      monu.category = tittle;
      monu.item = item;
      menu.push(monu);
    } //category loop
    console.log(menu[3].item);
    res.render("admin/admin_menu", {
      ptittle: "MENU",
      message: req.flash("message"),
      menu: menu,
    });
  } catch (error) {
    console.log(error);
  }
};

//category index
const categories = async (req, res) => {
  try {
    const categories = await CatModel.find();
    res.render("admin/admin_categories", {
      ptittle: "Categories",
      message: req.flash("message"),
      categories: categories,
    });
  } catch (error) {
    console.log(error);
  }
};
//get add category
const add_category = async (req, res) => {
  try {
    res.render("admin/admin_add_category", {
      message: req.flash("message"),
      ptittle: "Add Category",
    });
  } catch (error) {
    console.log(error);
  }
};

//Adding new category
const post_add_category = async (req, res) => {
  try {
    req.body.tittle = req.body.tittle.trim();
    req.body.tittle = req.body.tittle.replace("/", "-");
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
//get edit category
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
          ptittle: "Edit Category",
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
      ptittle: "Items",
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
//Post add new item
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
      console.log("hit");
      req.body.name = req.body.name.trim();
      req.body.price = req.body.price.replace("/", "-");
      const ab = new ItemModel(req.body);
      ab.slug = ab.name.replace(/\s+/g, "-").toLowerCase();
      const check = await ItemModel.findOne({ slug: ab.slug });
      //if item name already exists
      if (check) {
        not_valid("Item Name Already Exists");
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
          not_valid("Please Provide A Valid Image File");
        }
      }
      //If Image iS Not Uploaded
      else {
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
//Get edit item
const edit_item = async (req, res) => {
  try {
    const { slug } = req.params;
    const { action } = req.query;
    const item = await ItemModel.findOne({ slug });
    var message = "";
    switch (action) {
      //hide from menu
      case "hide":
        await ItemModel.updateOne({ slug }, { $set: { show: false } });
        message = `${item.name} Shown`;
        break;
      //show from menu
      case "show":
        await ItemModel.updateOne({ slug }, { $set: { show: true } });
        message = `${item.name} Hidden`;
        break;
      //edit item
      case "edit":
        var { name, image, show, price } = item;
        const assigned_category = item.category;
        const categories = await CatModel.find();
        return res.render("admin/admin_edit_item", {
          name: name,
          image: image,
          show: show,
          price: price,
          slug: slug,
          categories: categories,
          assignedcategory: assigned_category,
          linker: slug,
          message: req.flash("message"),
          ptittle: "Edit Item",
        });
        break;
      case "delete":
        await ItemModel.deleteOne({ slug });
        fs.removeSync(`public/images/product_images/${slug}`);
        message = "Item Deleted";
        break;
      default:
        message = "Unauthorized action";
        break;
    }
    req.flash("message", message);
    res.redirect("back");
  } catch (error) {
    console.log(error);
  }
};
//Post edit item
const post_edit_item = async (req, res) => {
  try {
    var message = "";
    var { slug } = req.params; //slug of item
    var item = await ItemModel.findOne({ slug });
    req.body.name = req.body.name.trim();
    req.body.price = req.body.price.trim();
    var { category, image, name, price } = item;
    var value = image.length; //for numbering image
    //If tittle is empty field
    if (req.body.name == "") {
      req.body.name = name;
    }
    //if new category is added
    if (req.body.category) {
      if (category.includes(req.body.category)) {
        message += `${req.body.category} Category is Already Linked `;
        req.body.category = category;
      } else {
        category.push(req.body.category);
        req.body.category = category;
        message += "New Category Linked ";
      }
    }
    //if category is empty
    else if (req.body.category == "") {
      req.body.category = category;
    }
    //if image is added
    if (req.files) {
      var newimage = req.files.image;
      var info = newimage.mimetype.split("/");
      //if image is valid
      if (info.includes("image")) {
        var newimagename = slug + value + "." + info[1];
        if (image.includes("noimage.png")) {
          image.splice(0, 1);
        }
        newimage.mv(
          `public/images/product_images/${slug}/${newimagename}`,
          async (err) => {
            if (err) console.log(err);
            //if image is moved to directory
            else {
              image.push(newimagename);
              await ItemModel.updateOne({ slug }, { $set: { image: image } });
            }
          }
        );
      }
      //if image is invalid
      else {
        message += "Invalid Image File ";
      }
    }
    //if price is added
    if (req.body.price) {
      if (price.includes(req.body.price)) {
        req.body.price = price;
        message += "Price Already Exists";
      } else {
        price.push(req.body.price);
        req.body.price = price;
        message += "New Price Added";
      }
    }
    //default
    else if (req.body.price == "") {
      req.body.price = price;
    } else {
      message += "Unauthorized Action";
    }
    await ItemModel.updateOne({ slug }, { $set: req.body });
    req.flash("message", message);
    res.redirect("back");
  } catch (error) {
    console.log(error);
  }
};
//Removing data and files linked to item
const edit_item_linked = async (req, res) => {
  try {
    const { slug, name } = req.params;
    const { action } = req.query;
    const item = await ItemModel.findOne({ slug });
    const { category, image, price } = item;

    var message;
    switch (action) {
      //removing Category
      case "removecategory":
        if (category.length < 2) {
          message = "Item Must Be Linked To A least One Category";
        } else {
          for (var i = 0; i < category.length; i++) {
            if (category[i] === name) category.splice(i, 1);
          }
          await ItemModel.updateOne({ slug }, { $set: { category: category } });
          message = "Category Unlinked From Item";
        }
        break;
      //Removing Image
      case "removeimage":
        for (var i = 0; i < image.length; i++) {
          if (image[i] === name) {
            image.splice(i, 1);
            fs.removeSync(`public/images/product_images/${slug}/${name}`);
          }
        }
        if (image.length < 1) image.push("noimage.png");
        await ItemModel.updateOne({ slug }, { $set: { image: image } });
        message = "Image Removed";
        break;
      //Removing Pricing
      case "removepricing":
        //if only one pricing exists
        if (price.length < 2) {
          message = "Item Must Have At Least One Pricing ";
        }
        //if More than one pricing is available
        else {
          for (var i = 0; i < price.length; i++) {
            if (price[i] === name) {
              price.splice(i, 1);
            }
          }
          await ItemModel.updateOne({ slug }, { $set: { price: price } });
          message = "Pricing Removed = " + name;
        }
        break;
      default:
        message = "Un-Authorized Action";
        break;
    }
    req.flash("message", message);
    res.redirect("back");
  } catch (error) {
    console.log(error);
  }
};
//exporting functions
module.exports = {
  menu,
  post_add_category,
  categories,
  add_category,
  edit_category,
  post_edit_category,
  items,
  add_items,
  post_add_item,
  edit_item,
  post_edit_item,
  edit_item_linked,
};
