const express = require("express");
const router = express.Router();
const ProductManager = require("../managers/ProductManager");
const { productsPaginatedPayload } = require("../utils/pagination");

const productManager = new ProductManager();

/**
 * GET / — listado paginado: limit (default 10), page (default 1), sort (asc|desc por precio), query (filtro).
 */
router.get("/", async (req, res) => {
  try {
    const limit =
      req.query.limit !== undefined ? Number(req.query.limit) : undefined;
    const page =
      req.query.page !== undefined ? Number(req.query.page) : undefined;
    const sort = req.query.sort;
    const query = req.query.query;

    const { docs, totalPages, page: currentPage } =
      await productManager.getProductsPaginated({
        limit,
        page,
        sort,
        query,
      });

    const body = productsPaginatedPayload(req, {
      payload: docs,
      totalPages,
      page: currentPage,
    });
    res.json(body);
  } catch (err) {
    res.status(500).json({
      status: "error",
      payload: err.message,
      totalPages: null,
      prevPage: null,
      nextPage: null,
      page: null,
      hasPrevPage: false,
      hasNextPage: false,
      prevLink: null,
      nextLink: null,
    });
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
    if (io) io.emit("productDeleted", String(pid));
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
