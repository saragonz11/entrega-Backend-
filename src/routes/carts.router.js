const express = require("express");
const router = express.Router();
const CartManager = require("../managers/CartManager");

const cartManager = new CartManager();

router.post("/", async (req, res) => {
  try {
    const cart = await cartManager.addCart();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Elimina una línea del carrito (por id numérico del producto). */
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartManager.removeProductFromCart(cid, pid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito o producto no encontrado" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Actualiza solo la cantidad de un producto en el carrito. */
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cart = await cartManager.updateProductQuantity(cid, pid, quantity);
    if (!cart) {
      return res.status(404).json({ error: "Carrito o producto no encontrado" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const quantity = 1;
    const cart = await cartManager.addProductToCart(cid, pid, quantity);
    if (!cart) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Reemplaza todas las líneas: body { products: [{ product, quantity }] } */
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ error: "Se requiere un arreglo products en el body" });
    }
    const cart = await cartManager.replaceCartProducts(cid, products);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Vacía el carrito (sin borrar el documento). */
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.clearCartProducts(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET carrito con productos poblados (documento completo por cada referencia).
 */
router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartByIdPopulated(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
