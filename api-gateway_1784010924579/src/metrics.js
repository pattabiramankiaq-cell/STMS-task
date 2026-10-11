const client = require("prom-client");

// Collect default Node.js metrics
client.collectDefaultMetrics();

// HTTP Request Counter
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

module.exports = {
  client,
  httpRequestCounter,
};
