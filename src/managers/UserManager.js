const Cart = require("../models/Cart");
const User = require("../models/User");
const { createHash } = require("../utils/security");

function userPublicDTO(userDoc) {
  if (!userDoc) return null;
  const user = typeof userDoc.toObject === "function" ? userDoc.toObject() : userDoc;
  const { password, ...safe } = user;
  return safe;
}

class UserManager {
  async _nextCartId() {
    const last = await Cart.findOne().sort({ id: -1 }).select("id").lean();
    return last ? last.id + 1 : 1;
  }

  async _createCartForUser() {
    const id = await this._nextCartId();
    const cart = await Cart.create({ id, products: [] });
    return cart;
  }

  async createUser(payload) {
    const existing = await User.findOne({ email: payload.email.toLowerCase().trim() });
    if (existing) {
      throw new Error("El email ya está registrado");
    }

    const cart = await this._createCartForUser();
    const user = await User.create({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email.toLowerCase().trim(),
      age: payload.age,
      password: createHash(payload.password),
      cart: cart._id,
      role: payload.role || "user",
    });
    return userPublicDTO(user);
  }

  async getUsers() {
    const users = await User.find().populate("cart").lean();
    return users.map(({ password, ...rest }) => rest);
  }

  async getUserById(uid) {
    const user = await User.findById(uid).populate("cart").lean();
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  }

  async updateUser(uid, fields) {
    const update = { ...fields };
    if (update.password !== undefined) {
      update.password = createHash(update.password);
    }
    if (update.email !== undefined) {
      update.email = String(update.email).toLowerCase().trim();
    }
    const user = await User.findByIdAndUpdate(uid, update, { new: true })
      .populate("cart")
      .lean();
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  }

  async deleteUser(uid) {
    const deleted = await User.findByIdAndDelete(uid).lean();
    return !!deleted;
  }
}

module.exports = UserManager;
