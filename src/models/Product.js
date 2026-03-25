const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    code: { type: String, default: "" },
    price: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    category: { type: String, default: "" },
    thumbnails: { type: [String], default: [] },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Product", productSchema);
