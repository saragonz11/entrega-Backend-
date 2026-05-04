const express = require("express");
const passport = require("passport");
const UserManager = require("../managers/UserManager");
const { authorizeRoles } = require("../middlewares/auth.middleware");

const router = express.Router();
const userManager = new UserManager();

router.get(
  "/",
  passport.authenticate("current", { session: false }),
  authorizeRoles("admin"),
  async (req, res) => {
  try {
    const users = await userManager.getUsers();
    res.json({ status: "success", payload: users });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
}
);

router.get(
  "/:uid",
  passport.authenticate("current", { session: false }),
  authorizeRoles("admin"),
  async (req, res) => {
  try {
    const user = await userManager.getUserById(req.params.uid);
    if (!user) {
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }
    res.json({ status: "success", payload: user });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
}
);

router.post("/", async (req, res) => {
  try {
    const created = await userManager.createUser(req.body);
    res.status(201).json({ status: "success", payload: created });
  } catch (err) {
    res.status(400).json({ status: "error", error: err.message });
  }
});

router.put(
  "/:uid",
  passport.authenticate("current", { session: false }),
  authorizeRoles("admin"),
  async (req, res) => {
  try {
    const updated = await userManager.updateUser(req.params.uid, req.body);
    if (!updated) {
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }
    res.json({ status: "success", payload: updated });
  } catch (err) {
    res.status(400).json({ status: "error", error: err.message });
  }
}
);

router.delete(
  "/:uid",
  passport.authenticate("current", { session: false }),
  authorizeRoles("admin"),
  async (req, res) => {
  try {
    const deleted = await userManager.deleteUser(req.params.uid);
    if (!deleted) {
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }
    res.json({ status: "success", message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
}
);

module.exports = router;
