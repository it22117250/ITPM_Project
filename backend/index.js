const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const routes = require("./route");

const prisma = new PrismaClient();
const app = express();
const PORT = 8080;

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// Centralized routing
app.use("/api", routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
