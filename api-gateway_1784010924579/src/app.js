require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const proxy = require("express-http-proxy");

// Prometheus
const { client, httpRequestCounter } = require("./metrics");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// Prometheus HTTP Request Counter
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });

  next();
});

// Prometheus Metrics Endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// Health Check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "API Gateway",
    status: "Running",
  });
});

// Auth Service Proxy
app.use(
  "/api/auth",
  proxy(process.env.AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
      return "/api/auth" + req.url;
    },
  })
);

// Task Service Proxy
app.use(
  "/api/tasks",
  proxy(process.env.TASK_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
      return "/api/tasks" + req.url;
    },
  })
);

module.exports = app;
