const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { createProxyMiddleware } = require("http-proxy-middleware");

const apiLimiter = require("./middleware/rateLimiter");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();


// SECURITY
app.use(cors());
app.use(helmet());


// LOGGING
app.use(morgan("dev"));


// RATE LIMITING
app.use(apiLimiter);


// API VERSIONING
const API_VERSION = "/api/v1";

// AUTH SERVICE
app.use(
  `${API_VERSION}/auth`,
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
  })
);

// SHED SERVICE
app.use(
  `${API_VERSION}/sheds`,
  createProxyMiddleware({
    target: process.env.SHED_SERVICE_URL,
    changeOrigin: true,
  })
);

// HEALTH CHECK
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fuelink API Gateway Running",
  });
});

// JSON PARSER (Must be after proxies so body stream isn't consumed)
app.use(express.json());


// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});


// GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app;