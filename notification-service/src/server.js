require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5003;

connectDB();

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});

