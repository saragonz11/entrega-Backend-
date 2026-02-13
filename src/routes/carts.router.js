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

router.get("/:cid", async (req, res) => {
  try {
    const products = await cartManager.getCartProducts(req.params.cid);
    if (products === null) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(products);
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
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
