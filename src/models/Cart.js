const mongoose = require("mongoose");

/**
 * Línea del carrito: referencia al documento Product (ObjectId) + cantidad.
 */
const cartLineSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    products: { type: [cartLineSchema], default: [] },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Cart", cartSchema);
