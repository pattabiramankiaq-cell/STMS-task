const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const taskRoutes = require("./routes/task.routes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Task Service",
    status: "Running"
  });
});

app.use("/api/tasks", taskRoutes);

module.exports = app;



