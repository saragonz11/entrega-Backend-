function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        status: "error",
        error: "No autorizado para realizar esta acción",
      });
    }
    next();
  };
}

module.exports = { authorizeRoles };
