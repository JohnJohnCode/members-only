const Message = require("../models/message");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

// Display index page.
exports.index = (req, res) => {
  Message.find({})
    .sort({ timestamp: -1 })
    .populate("author")
    .exec((err, results) => {
      if (err) return next(err);
      res.render("index", { title: "Members Only: posts", messages: results });
    });
};

// Display user sign up form page.
exports.user_signup_get = (req, res) => {
  res.render("sign-up", { title: "Members Only: sign up" });
};

// Post methods for user sign up form.
exports.user_signup_post = [
  // Sanitize and validate form data.
  body("username", "Username must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirmPassword")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Password must not be empty.")
    .escape()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords must match."),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Hash password.
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      // Create new user with using form data.
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
        member: false,
        admin: false,
      });

      if (!errors.isEmpty()) {
        res.render("sign-up", {
          title: "Members Only: sign up",
          user,
          errors: errors.array(),
        });
        return;
      } else {
        // Check if a user with submitted username already exists.
        User.findOne({ username: req.body.username }).exec(
          (err, found_user) => {
            if (err) {
              return next(err);
            }
            // Duplicate username found, render sign up form with appropriate error message.
            if (found_user) {
              res.render("sign-up", {
                title: "Members Only: sign up",
                user,
                errors: [{ msg: "Username taken" }],
              });
              return;
            } else {
              // Success, save user and render index page.
              user.save((err) => {
                if (err) {
                  return next(err);
                }
                res.redirect("/");
              });
            }
          }
        );
      }
    });
  },
];

// Display user log in form page.
exports.user_login_get = (req, res) => {
  if (res.locals.currentUser) {
    res.redirect("/");
  } else {
    res.render("log-in", { title: "Members Only: log in" });
  }
};

// Post method for log in form page.
exports.user_login_post = [
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  }),
];

// Method for handling the logging out of a user.
exports.user_logout_get = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

// Display membership form page.
exports.user_membership_get = (req, res) => {
  res.render("membership", { title: "Members Only: membership" });
};

// Post methods for membership form page.
exports.user_membership_post = [
  // Sanitize and validate form data.
  body("passcode")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Empty submission.")
    .escape()
    .custom(
      (value) =>
        value === process.env.ADMIN_PASSCODE ||
        value === process.env.MEMBER_PASSCODE
    )
    .withMessage("Incorrect passcode."),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("membership", {
        title: "Members Only: membership",
        errors: errors.array(),
      });
      return;
    } else {
      // Check if user is logged in.
      if (res.locals.currentUser) {
        // Find the logged in user in our database.
        User.findOne({ _id: res.locals.currentUser._id }).exec(
          (err, found_user) => {
            if (err) {
              return next(err);
            }
            // If user is in our database, check whether the passcode was correct and handle appropriately
            if (found_user) {
              if (req.body.passcode === process.env.MEMBER_PASSCODE) {
                found_user.member = true;
                found_user.save();
              }
              if (req.body.passcode === process.env.ADMIN_PASSCODE) {
                found_user.admin = true;
                found_user.save();
              }
              res.redirect("/");
            } else {
              // User not found, rerender membership form with error message.
              res.render("membership", {
                title: "Members Only: membership",
                errors: { msg: "User not found." },
              });
            }
          }
        );
      } else {
        // User isn't logged in, redirect to log in page.
        res.redirect("/log-in");
      }
    }
  },
];
