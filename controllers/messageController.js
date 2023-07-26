const Message = require("../models/message");
const { body, validationResult } = require("express-validator");

// Display message creation form page.
exports.message_new_get = (req, res) => {
  res.render("message", { title: "Members Only: create a new message " });
};

// Post new message.
exports.message_new_post = [
  // Sanitize and validate message.
  body("message")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Cannot post empty message.")
    .isLength({ max: 300 })
    .withMessage("Message too long (max. 300 characters).")
    .escape(),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("message", {
        title: "Members Only: create a new message",
        errors: errors.array(),
      });
      return;
    } else {
      // Check if user is logged in.
      if (res.locals.currentUser) {
        const message = new Message({
          author: res.locals.currentUser,
          text: req.body.message,
          timestamp: new Date(),
        });
        Message.find({})
          .sort({ timestamp: -1 })
          .populate("author")
          .exec((err, results) => {
            if (err) return next(err);
            message.save();
            res.redirect("/");
          });
      } else {
        // User isn't logged in so render log in form.
        res.redirect("/log-in");
      }
    }
  },
];

// Post method for deleting messages.
exports.message_delete_post = (req, res, next) => {
  Message.findByIdAndDelete(req.body.messageid, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
