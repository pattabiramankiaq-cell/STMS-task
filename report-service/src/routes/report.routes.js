// Dashboard and report routes placeholder

const express = require("express");
const router = express.Router();

const {
  createReport
} = require("../controllers/report.controller");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Report Service API Working"
  });
});

router.post("/create", createReport);

module.exports = router;


