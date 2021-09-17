const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  image: [{ type: String, default: "noimage.png" }],
  show: { type: Boolean, default: true },
  price: [{ type: String, trim: true }],
  slug: { type: String, unique: true },
  category: [{ type: String }],
  name: {
    type: String,
    required: true,
    trim: true,
    unique: [true, "tittle already exists"],
  },
});

const ItemModel = (module.exports = new mongoose.model("Item", itemSchema));
