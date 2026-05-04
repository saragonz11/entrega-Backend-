const express = require("express");
const { create } = require("express-handlebars");
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const initializePassport = require("./config/passport.config");
const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const usersRouter = require("./routes/users.router");
const sessionsRouter = require("./routes/sessions.router");
const viewsRouter = require("./routes/views.router");

const app = express();
const hbs = create({
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views", "layouts"),
  partialsDir: path.join(__dirname, "views", "partials"),
  helpers: {
    eq: (a, b) => a === b,
  },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

initializePassport();
app.use(passport.initialize());

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);

module.exports = app;
