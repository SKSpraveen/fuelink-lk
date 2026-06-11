const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));


// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API Gateway Running...");
});


// AUTH SERVICE PROXY
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
  })
);


// SHED SERVICE PROXY
app.use(
  "/api/sheds",
  createProxyMiddleware({
    target: process.env.SHED_SERVICE_URL,
    changeOrigin: true,
  })
);

module.exports = app;