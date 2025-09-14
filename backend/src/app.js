const express = require("express");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const cors = require("cors"); // Import cors
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // Added this line
const { createUsersTable } = require("./models/User");
const { createTasksTable } = require("./models/Task");

const app = express();

// Load Swagger YAML file
const swaggerDocument = YAML.load(path.join(__dirname, "../docs/swagger.yaml"));

// Enable request logging with custom format
app.use(
  morgan(
    "\n[Request] :method :url\n[Response] Status: :status Time: :response-time ms"
  )
);

// Enable CORS
app.use(cors());

// Increase JSON payload limit for base64 images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);
const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize database tables
createUsersTable();
createTasksTable();

module.exports = app;
