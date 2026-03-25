const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

/**
 * Serializa un carrito con productos poblados para JSON (incluye id numérico del producto).
 */
function serializePopulatedCart(cartLean) {
  if (!cartLean) return null;
  return {
    id: cartLean.id,
    products: (cartLean.products || []).map((line) => {
      const p = line.product;
      if (!p || typeof p !== "object") {
        return { quantity: line.quantity, product: null };
      }
      const { _id, id, title, description, code, price, status, stock, category, thumbnails } = p;
      return {
        quantity: line.quantity,
        product: {
          id,
          title,
          description,
          code,
          price,
          status,
          stock,
          category,
          thumbnails,
          _id,
        },
      };
    }),
  };
}

class CartManager {
  async _nextId() {
    const last = await Cart.findOne().sort({ id: -1 }).select("id").lean();
    return last ? last.id + 1 : 1;
  }

  async addCart() {
    const id = await this._nextId();
    const doc = await Cart.create({ id, products: [] });
    return this.getCartByIdPopulated(doc.id);
  }

  async getCartById(cid) {
    const id = Number(cid);
    if (Number.isNaN(id)) return null;
    return Cart.findOne({ id }).lean();
  }

  /**
   * Carrito con products.product poblado (documento completo).
   */
  async getCartByIdPopulated(cid) {
    const id = Number(cid);
    if (Number.isNaN(id)) return null;
    const cart = await Cart.findOne({ id })
      .populate({ path: "products.product", model: "Product" })
      .lean();
    return serializePopulatedCart(cart);
  }

  /**
   * Obtiene el carrito por id numérico o lo crea vacío si aún no existe.
   */
  async _getOrCreateCartDocument(cartId) {
    return Cart.findOneAndUpdate(
      { id: cartId },
      { $setOnInsert: { id: cartId, products: [] } },
      { upsert: true, new: true, runValidators: true }
    );
  }

  async addProductToCart(cid, pid, quantity = 1) {
    const cartId = Number(cid);
    const productOid = await this._resolveProductObjectId(pid);
    if (Number.isNaN(cartId) || !productOid) return null;

    const cart = await this._getOrCreateCartDocument(cartId);

    const existing = cart.products.find((p) => p.product.equals(productOid));
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.products.push({ product: productOid, quantity });
    }
    await cart.save();
    return this.getCartByIdPopulated(cartId);
  }

  async removeProductFromCart(cid, pid) {
    const cartId = Number(cid);
    const productOid = await this._resolveProductObjectId(pid);
    if (Number.isNaN(cartId) || !productOid) return null;

    const cart = await Cart.findOne({ id: cartId });
    if (!cart) return null;

    cart.products = cart.products.filter((p) => !p.product.equals(productOid));
    await cart.save();
    return this.getCartByIdPopulated(cartId);
  }

  /**
   * Reemplaza todas las líneas del carrito. Body: { products: [{ product: id numérico u ObjectId, quantity }] }
   */
  async replaceCartProducts(cid, productsInput) {
    const cartId = Number(cid);
    if (Number.isNaN(cartId)) return null;
    if (!Array.isArray(productsInput)) return null;

    const cart = await Cart.findOne({ id: cartId });
    if (!cart) return null;

    const byOid = new Map();
    for (const item of productsInput) {
      const oid = await this._resolveProductObjectId(item.product);
      if (!oid) continue;
      const qty = Math.max(1, Number(item.quantity) || 1);
      byOid.set(String(oid), { product: oid, quantity: qty });
    }
    cart.products = [...byOid.values()];
    await cart.save();
    return this.getCartByIdPopulated(cartId);
  }

  /**
   * Actualiza solo la cantidad de una línea (req.body.quantity).
   */
  async updateProductQuantity(cid, pid, quantity) {
    const cartId = Number(cid);
    const productOid = await this._resolveProductObjectId(pid);
    const qty = Number(quantity);
    if (Number.isNaN(cartId) || !productOid || Number.isNaN(qty) || qty < 1) {
      return null;
    }

    const cart = await Cart.findOne({ id: cartId });
    if (!cart) return null;

    const line = cart.products.find((p) => p.product.equals(productOid));
    if (!line) return null;
    line.quantity = qty;
    await cart.save();
    return this.getCartByIdPopulated(cartId);
  }

  /** Elimina todas las líneas del carrito (el carrito sigue existiendo). */
  async clearCartProducts(cid) {
    const cartId = Number(cid);
    if (Number.isNaN(cartId)) return null;
    const cart = await Cart.findOne({ id: cartId });
    if (!cart) return null;
    cart.products = [];
    await cart.save();
    return this.getCartByIdPopulated(cartId);
  }

  async _resolveProductObjectId(pid) {
    if (pid == null) return null;
    if (typeof pid === "object" && pid._id) return pid._id;
    const str = String(pid);
    if (mongoose.Types.ObjectId.isValid(str) && str.length === 24) {
      return new mongoose.Types.ObjectId(str);
    }
    const id = Number(pid);
    if (Number.isNaN(id)) return null;
    const p = await Product.findOne({ id }).select("_id").lean();
    return p ? p._id : null;
  }
}

module.exports = CartManager;
