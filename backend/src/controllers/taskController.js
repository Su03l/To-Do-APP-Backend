const Task = require("../models/Task");

// Create a new task for a user
exports.createTask = async (req, res) => {
  try {
    const { title, description, start_date, end_date, time, notes } = req.body;
    const user_id = req.user.id;
    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }
    const task = await Task.createTask({ user_id, title, description, start_date, end_date, time, notes });
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tasks for a user
exports.getTasksByUser = async (req, res) => {
  try {
    const user_id = req.user.id;
    const tasks = await Task.getTasksByUserId(user_id);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const task = await Task.getTaskById(id);
    if (!task || task.user_id !== user_id) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark task as done
exports.markTaskDone = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const task = await Task.getTaskById(id);
    if (!task || task.user_id !== user_id) {
      return res.status(404).json({ message: "Task not found" });
    }
    const updated = await Task.markTaskDone(id);
    res.json(updated);
  } catch (error) {
    console.error("Error marking task done:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit task
exports.editTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, time, notes } = req.body;
    const updated = await Task.editTask(id, { title, description, start_date, end_date, time, notes });
    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error editing task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.deleteTask(id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error" });
  }
};
