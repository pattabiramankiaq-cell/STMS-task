require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5002;

connectDB();

app.listen(PORT, () => {
  console.log(`Task Service running on port ${PORT}`);
});

