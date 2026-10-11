const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  register,
  login,
  profile
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);

module.exports = router;



