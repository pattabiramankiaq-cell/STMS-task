
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const reportRoutes = require("./routes/report.routes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Report Service",
    status: "Running"
  });
});

app.use("/api/reports", reportRoutes);

module.exports = app;



