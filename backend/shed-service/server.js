require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5002;

connectDB();

app.listen(PORT, () => {
  console.log(`Shed Service running on port ${PORT}`);
});