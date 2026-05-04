const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/User");
const UserManager = require("../managers/UserManager");
const { isValidPassword } = require("../utils/security");

const userManager = new UserManager();

function cookieExtractor(req) {
  if (req && req.cookies) {
    return req.cookies.jwtCookieToken || null;
  }
  return null;
}

function initializePassport() {
  passport.use(
    "register",
    new LocalStrategy(
      {
        usernameField: "email",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name, age, role } = req.body;
          if (!first_name || !last_name || !email || !password || age === undefined) {
            return done(null, false, { message: "Faltan campos requeridos" });
          }
          const user = await userManager.createUser({
            first_name,
            last_name,
            email,
            age: Number(age),
            password,
            role,
          });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: String(email).toLowerCase().trim() })
            .populate("cart");
          if (!user) {
            return done(null, false, { message: "Credenciales inválidas" });
          }
          if (!isValidPassword(user, password)) {
            return done(null, false, { message: "Credenciales inválidas" });
          }
          const userObj = user.toObject();
          delete userObj.password;
          return done(null, userObj);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    "current",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          cookieExtractor,
          ExtractJwt.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: process.env.JWT_SECRET || "dev_jwt_secret",
      },
      async (jwtPayload, done) => {
        try {
          const user = await User.findById(jwtPayload.uid).populate("cart").lean();
          if (!user) return done(null, false);
          const { password, ...safe } = user;
          return done(null, safe);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

module.exports = initializePassport;
