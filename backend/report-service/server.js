require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5005;

connectDB();

app.listen(PORT, () => {
  console.log(`Report service listening on port ${PORT}`);
});
