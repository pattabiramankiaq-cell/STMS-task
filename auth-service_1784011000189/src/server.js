require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Start Server
app.listen(PORT, () => {
    console.log( ` Auth Service running on port ${PORT}`);
});
