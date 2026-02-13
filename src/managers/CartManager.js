const fs = require("fs").promises;
const path = require("path");

class CartManager {
  constructor(filePath = "carts.json") {
    this.path = path.join(process.cwd(), "src", "data", filePath);
  }

  async _readFile() {
    try {
      const data = await fs.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        return [];
      }
      throw err;
    }
  }

  async _writeFile(carts) {
    const dir = path.dirname(this.path);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8");
  }

  async addCart() {
    const carts = await this._readFile();
    const maxId = carts.length
      ? Math.max(
          ...carts.map((c) =>
            typeof c.id === "number" ? c.id : parseInt(c.id, 10) || 0
          )
        )
      : 0;
    const id = maxId + 1;
    const cart = { id, products: [] };
    carts.push(cart);
    await this._writeFile(carts);
    return cart;
  }

  async getCartById(cid) {
    const carts = await this._readFile();
    const cart = carts.find((c) => String(c.id) === String(cid));
    return cart ?? null;
  }

  async getCartProducts(cid) {
    const cart = await this.getCartById(cid);
    if (!cart) return null;
    return cart.products;
  }

  async addProductToCart(cid, pid, quantity = 1) {
    const carts = await this._readFile();
    const cartIndex = carts.findIndex((c) => String(c.id) === String(cid));
    if (cartIndex === -1) return null;

    const cart = carts[cartIndex];
    const productId = String(pid);
    const existing = cart.products.find((p) => String(p.product) === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await this._writeFile(carts);
    return carts[cartIndex];
  }
}

module.exports = CartManager;
