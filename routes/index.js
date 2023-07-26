var express = require('express');
var router = express.Router();

// Require controller modules.
const user_controller = require("../controllers/userController");
const message_controller = require("../controllers/messageController");

// GET request for home page.
router.get("/", user_controller.index);

// POST request to delete a message.
router.post("/", message_controller.message_delete_post);

// GET request for sign up form.
router.get("/sign-up", user_controller.user_signup_get);

// POST request to sign up.
router.post("/sign-up", user_controller.user_signup_post);

// GET request for log in form.
router.get("/log-in", user_controller.user_login_get);

// POST request to log in.
router.post("/log-in", user_controller.user_login_post);

// POST request to log out.
router.get("/log-out", user_controller.user_logout_get);

// GET request for membership form.
router.get("/membership", user_controller.user_membership_get);

// POST request for membership form.
router.post("/membership", user_controller.user_membership_post);

// GET request for message form.
router.get("/new", message_controller.message_new_get);

// POST request to post a new message.
router.post("/new", message_controller.message_new_post);


module.exports = router;
