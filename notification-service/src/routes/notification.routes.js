// Email, Slack and Webhook routes placeholder

const express = require("express");
const router = express.Router();

const {
  createNotification
} = require("../controllers/notification.controller");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Notification Service API Working"
  });
});

router.post("/create", createNotification);

module.exports = router;

