const fs = require("fs").promises;
const path = require("path");

class ProductManager {
  constructor(filePath = "products.json") {
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

  async _writeFile(products) {
    const dir = path.dirname(this.path);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(products, null, 2), "utf-8");
  }

  async getProducts() {
    return this._readFile();
  }

  async getProductById(pid) {
    const products = await this._readFile();
    const product = products.find((p) => String(p.id) === String(pid));
    if (!product) {
      return null;
    }
    return product;
  }

  async addProduct(productData) {
    const products = await this._readFile();
    const maxId = products.length
      ? Math.max(
          ...products.map((p) =>
            typeof p.id === "number" ? p.id : parseInt(p.id, 10) || 0
          )
        )
      : 0;
    const id = maxId + 1;

    const product = {
      id,
      title: productData.title,
      description: productData.description ?? "",
      code: productData.code ?? "",
      price: productData.price ?? 0,
      status: productData.status !== undefined ? productData.status : true,
      stock: productData.stock ?? 0,
      category: productData.category ?? "",
      thumbnails: Array.isArray(productData.thumbnails)
        ? productData.thumbnails
        : [],
    };

    products.push(product);
    await this._writeFile(products);
    return product;
  }

  async updateProduct(pid, fields) {
    const products = await this._readFile();
    const index = products.findIndex((p) => String(p.id) === String(pid));
    if (index === -1) {
      return null;
    }

    const { id, ...rest } = fields;
    const allowedKeys = [
      "title",
      "description",
      "code",
      "price",
      "status",
      "stock",
      "category",
      "thumbnails",
    ];
    for (const key of allowedKeys) {
      if (rest[key] !== undefined) {
        products[index][key] = rest[key];
      }
    }

    await this._writeFile(products);
    return products[index];
  }

  async deleteProduct(pid) {
    const products = await this._readFile();
    const index = products.findIndex((p) => String(p.id) === String(pid));
    if (index === -1) {
      return false;
    }
    products.splice(index, 1);
    await this._writeFile(products);
    return true;
  }
}

module.exports = ProductManager;
