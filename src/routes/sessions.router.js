const express = require("express");
const passport = require("passport");
const { signToken } = require("../utils/security");

const router = express.Router();

router.post(
  "/register",
  passport.authenticate("register", { session: false }),
  async (req, res) => {
    try {
      const token = signToken({
        uid: req.user._id,
        email: req.user.email,
        role: req.user.role,
      });
      res
        .cookie("jwtCookieToken", token, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000,
        })
        .status(201)
        .json({ status: "success", token, user: req.user });
    } catch (err) {
      res.status(500).json({ status: "error", error: err.message });
    }
  }
);

router.post("/login", (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        status: "error",
        error: (info && info.message) || "Credenciales inválidas",
      });
    }
    try {
      const token = signToken({
        uid: user._id,
        email: user.email,
        role: user.role,
      });
      return res
        .cookie("jwtCookieToken", token, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000,
        })
        .json({ status: "success", token, user });
    } catch (signErr) {
      return res.status(500).json({ status: "error", error: signErr.message });
    }
  })(req, res, next);
});

router.get(
  "/current",
  passport.authenticate("current", { session: false }),
  (req, res) => {
    res.json({ status: "success", user: req.user });
  }
);

router.post("/logout", (req, res) => {
  res
    .clearCookie("jwtCookieToken")
    .json({ status: "success", message: "Sesión cerrada" });
});

module.exports = router;
