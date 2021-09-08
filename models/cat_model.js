const mongoose = require("mongoose");

const catSchema = new mongoose.Schema({
  tittle: {
    type: String,
    required: true,
    trim: true,
    unique: [true, "tittle already exists"],
  },
  slug: { type: String, trim: true, required: true, unique: true },
  image: { type: String, trim: true, default: "noimage.png" },
  show: { type: Boolean, default: true },
});

const CatMododel = (module.exports = mongoose.model("category", catSchema));
