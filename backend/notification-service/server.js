require('dotenv').config();
const connectDB = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5003;

connectDB();

app.listen(PORT, () => {
  console.log(`Notification service listening on port ${PORT}`);
});
