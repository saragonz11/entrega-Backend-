const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

function isValidPassword(user, plainPassword) {
  if (!user || !user.password) return false;
  return bcrypt.compareSync(plainPassword, user.password);
}

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Falta la variable de entorno JWT_SECRET");
  }
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

module.exports = { createHash, isValidPassword, signToken };
