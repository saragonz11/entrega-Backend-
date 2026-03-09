const express = require("express");
const router = express.Router();
const ProductManager = require("../managers/ProductManager");

const productManager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = req.body;
    if (!title || price === undefined) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos: title, price" });
    }
    const product = await productManager.addProduct({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    });
    const io = req.app.get("io");
    if (io) io.emit("productCreated", product);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await productManager.updateProduct(
      req.params.pid,
      req.body
    );
    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const deleted = await productManager.deleteProduct(pid);
    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const io = req.app.get("io");
    if (io) io.emit("productDeleted", pid);
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
