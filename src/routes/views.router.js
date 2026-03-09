const express = require("express");
const router = express.Router();
const ProductManager = require("../managers/ProductManager");

const productManager = new ProductManager();

router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", {
      products,
      title: "Productos en tiempo real",
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
