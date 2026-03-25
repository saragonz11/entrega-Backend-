const express = require("express");
const router = express.Router();
const ProductManager = require("../managers/ProductManager");
const CartManager = require("../managers/CartManager");

const productManager = new ProductManager();
const cartManager = new CartManager();

/** Query string para enlaces de paginación en /products */
function productsViewQuery(req, page, limitUsed) {
  const params = new URLSearchParams();
  params.set("limit", String(limitUsed ?? req.query.limit ?? 10));
  params.set("page", String(page));
  if (req.query.sort) params.set("sort", String(req.query.sort));
  if (req.query.query) params.set("query", String(req.query.query));
  return `?${params.toString()}`;
}

router.get("/", (req, res) => {
  res.redirect("/products");
});

router.get("/products", async (req, res) => {
  try {
    const limit =
      req.query.limit !== undefined ? Number(req.query.limit) : undefined;
    const page =
      req.query.page !== undefined ? Number(req.query.page) : undefined;
    const sort = req.query.sort;
    const query = req.query.query;

    const { docs, totalPages, page: currentPage, limit: usedLimit } =
      await productManager.getProductsPaginated({
        limit,
        page,
        sort,
        query,
      });

    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;
    const prevLink = hasPrevPage
      ? `/products${productsViewQuery(req, currentPage - 1, usedLimit)}`
      : null;
    const nextLink = hasNextPage
      ? `/products${productsViewQuery(req, currentPage + 1, usedLimit)}`
      : null;

    res.render("index", {
      title: "Catálogo",
      products: docs,
      page: currentPage,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
      limit: usedLimit,
      sort: sort || "",
      query: query || "",
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/products/:pid", async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }
    res.render("productDetail", {
      title: product.title,
      product,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartByIdPopulated(req.params.cid);
    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }
    const productsWithSubtotal = cart.products.map((line) => ({
      ...line,
      subtotal:
        line.product && typeof line.product.price === "number"
          ? (line.product.price * line.quantity).toFixed(2)
          : null,
    }));
    res.render("cartView", {
      title: `Carrito ${cart.id}`,
      cart: { id: cart.id, products: productsWithSubtotal },
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

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
