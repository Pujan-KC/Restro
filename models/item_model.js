const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: [true, "tittle already exists"],
  },
  category: [{ type: String }],
  image: [{ type: String, trim: true, default: "noimage.png" }],
  show: { type: Boolean, default: true },
  price: [{ type: String, trim: true }],
  slug: { type: String, unique: true },
});

const ItemModel = (module.exports = mongoose.model("Item", itemSchema));
