const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { createProxyMiddleware } = require("http-proxy-middleware");

const apiLimiter = require("./middleware/rateLimiter");
const { protect } = require("./middleware/authMiddleware");

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
    target: process.env.AUTH_SERVICE_URL || "http://127.0.0.1:5001",
    changeOrigin: true,
    pathRewrite: {
      [`^${API_VERSION}/auth`]: "",
    },
  })
);

// SHED SERVICE
app.use(
  `${API_VERSION}/sheds`,
  protect,
  createProxyMiddleware({
    target: process.env.SHED_SERVICE_URL || "http://127.0.0.1:5002",
    changeOrigin: true,
    pathRewrite: {
      [`^${API_VERSION}/sheds`]: "",
    },
  })
);

// NOTIFICATION SERVICE
app.use(
  `${API_VERSION}/notifications`,
  protect,
  createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL || "http://127.0.0.1:5003",
    changeOrigin: true,
    pathRewrite: {
      [`^${API_VERSION}/notifications`]: "",
    },
  })
);

// CHAT SERVICE
app.use(
  `${API_VERSION}/chats`,
  protect,
  createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL || "http://127.0.0.1:5004",
    changeOrigin: true,
    pathRewrite: {
      [`^${API_VERSION}/chats`]: "",
    },
  })
);

// REPORT SERVICE
app.use(
  `${API_VERSION}/reports`,
  protect,
  createProxyMiddleware({
    target: process.env.REPORT_SERVICE_URL || "http://127.0.0.1:5005",
    changeOrigin: true,
    pathRewrite: {
      [`^${API_VERSION}/reports`]: "",
    },
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