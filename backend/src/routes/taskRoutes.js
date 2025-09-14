const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

// Get a single task by ID
router.get("/:id", authMiddleware.protect, taskController.getTaskById);

// Mark task as done
router.put("/:id/done", authMiddleware.protect, taskController.markTaskDone);

// Edit task
router.put("/:id", authMiddleware.protect, taskController.editTask);

// Delete task
router.delete("/:id", authMiddleware.protect, taskController.deleteTask);

// Create a new task (protected)
router.post("/", authMiddleware.protect, taskController.createTask);

// Get all tasks for current user (protected)
router.get("/", authMiddleware.protect, taskController.getTasksByUser);

module.exports = router;