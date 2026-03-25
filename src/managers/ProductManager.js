const Product = require("../models/Product");
const Cart = require("../models/Cart");

class ProductManager {
  async _nextId() {
    const last = await Product.findOne().sort({ id: -1 }).select("id").lean();
    return last ? last.id + 1 : 1;
  }

  /**
   * Interpreta el query param `query`:
   * - `category:valor` → filtro por categoría (coincidencia parcial, case insensitive)
   * - `availability:available` | `disponible` → status true y stock > 0
   * - `availability:unavailable` | `nodisponible` → resto
   * - cualquier otro texto → búsqueda general en título y descripción
   */
  _filterFromQueryString(queryStr) {
    if (!queryStr || !String(queryStr).trim()) {
      return {};
    }
    const q = String(queryStr).trim();
    const lower = q.toLowerCase();
    if (lower.startsWith("category:")) {
      const cat = q.slice("category:".length).trim();
      if (!cat) return {};
      return { category: new RegExp(cat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") };
    }
    if (lower.startsWith("availability:")) {
      const v = q.slice("availability:".length).trim().toLowerCase();
      if (v === "available" || v === "disponible") {
        return { status: true, stock: { $gt: 0 } };
      }
      if (v === "unavailable" || v === "nodisponible") {
        return { $or: [{ status: false }, { stock: { $lte: 0 } }] };
      }
      return {};
    }
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return {
      $or: [
        { title: new RegExp(escaped, "i") },
        { description: new RegExp(escaped, "i") },
      ],
    };
  }

  /**
   * Listado paginado para GET /api/products.
   * @param {{ limit?: number, page?: number, sort?: string, query?: string }} opts
   */
  async getProductsPaginated(opts = {}) {
    const limit = Math.min(Math.max(1, Number(opts.limit) || 10), 100);
    const pageRaw = Math.max(1, Number(opts.page) || 1);
    const sort = opts.sort;
    const filter = this._filterFromQueryString(opts.query);

    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    else if (sort === "desc") sortOption.price = -1;

    const total = await Product.countDocuments(filter);
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
    const page = Math.min(pageRaw, totalPages);
    const skip = (page - 1) * limit;

    const docs = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    return { docs, total, totalPages, page, limit };
  }

  async getProducts() {
    return Product.find().sort({ id: 1 }).lean();
  }

  async getProductById(pid) {
    const id = Number(pid);
    if (Number.isNaN(id)) return null;
    return Product.findOne({ id }).lean();
  }

  async addProduct(productData) {
    const id = await this._nextId();
    const doc = await Product.create({
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
    });
    return doc.toObject();
  }

  async updateProduct(pid, fields) {
    const id = Number(pid);
    if (Number.isNaN(id)) return null;
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
    const update = {};
    for (const key of allowedKeys) {
      if (fields[key] !== undefined) {
        update[key] = fields[key];
      }
    }
    if (Object.keys(update).length === 0) {
      return Product.findOne({ id }).lean();
    }
    const doc = await Product.findOneAndUpdate({ id }, update, {
      new: true,
    }).lean();
    return doc;
  }

  async deleteProduct(pid) {
    const id = Number(pid);
    if (Number.isNaN(id)) return false;
    const existing = await Product.findOne({ id }).select("_id").lean();
    if (!existing) return false;
    await Cart.updateMany(
      {},
      { $pull: { products: { product: existing._id } } }
    );
    const result = await Product.deleteOne({ id });
    return result.deletedCount === 1;
  }
}

module.exports = ProductManager;
