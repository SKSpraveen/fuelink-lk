require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { autoLeaveOldSessions } = require("./src/controllers/shedController");

const PORT = process.env.PORT || 5002;

connectDB();

app.listen(PORT, () => {
  console.log(`Shed Service running on port ${PORT}`);
  
  // Run cron job every 15 minutes to clear old queue sessions
  setInterval(() => {
    autoLeaveOldSessions();
  }, 15 * 60 * 1000);
});