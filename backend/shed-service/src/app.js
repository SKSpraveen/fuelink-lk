const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const shedRoutes = require("./routes/shedRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Shed Service Running...");
});

app.use("/", shedRoutes);

module.exports = app;