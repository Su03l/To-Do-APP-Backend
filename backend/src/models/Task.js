const { query } = require("../config");

/**
 * @typedef {object} Task
 * @property {string} id - Task ID
 * @property {string} user_id - User ID
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {boolean} completed - Task completion status
 * @property {string} created_at - Timestamp of creation
 * @property {string} start_date - Start date of the task
 * @property {string} end_date - End date of the task
 * @property {string} time - Time of the task
 * @property {string} notes - Notes for the task
 */

/**
 * Creates the tasks table if it doesn't exist.
 */
const createTasksTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        start_date DATE,
        end_date DATE,
        time TIME,
        notes TEXT,
        deleted_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log("Tasks table created or already exists.");
  } catch (error) {
    console.error("Error creating tasks table:", error);
  }
};

/**
 * Creates a new task for a user.
 * @param {object} taskData - The task data.
 * @returns {Promise<Task>} The newly created task object.
 */
const createTask = async (taskData) => {
  const { user_id, title, description, start_date, end_date, time, notes } = taskData;
  const { rows } = await query(
    "INSERT INTO tasks (user_id, title, description, start_date, end_date, time, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [user_id, title, description, start_date, end_date, time, notes]
  );
  return rows[0];
};

/**
 * Gets all tasks for a user.
 * @param {string} user_id - The user's ID.
 * @returns {Promise<Task[]>} Array of tasks.
 */
const getTasksByUserId = async (user_id) => {
  const { rows } = await query(
    "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
    [user_id]
  );
  return rows;
};

/**
 * Get a task by its ID.
 * @param {string} id - Task ID.
 * @returns {Promise<Task|null>} Task object or null.
 */
const getTaskById = async (id) => {
  const { rows } = await query("SELECT * FROM tasks WHERE id = $1", [id]);
  return rows[0] || null;
};

/**
 * Mark a task as completed.
 * @param {string} id - Task ID.
 * @returns {Promise<Task|null>} Updated task or null.
 */
const markTaskDone = async (id) => {
  const { rows } = await query(
    "UPDATE tasks SET completed = TRUE, completed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );
  return rows[0] || null;
};

/**
 * Edit a task's details.
 * @param {string} id - Task ID.
 * @param {object} updates - { title, description, start_date, end_date, time, notes }
 * @returns {Promise<Task|null>} Updated task or null.
 */
const editTask = async (id, updates) => {
  const { title, description, start_date, end_date, time, notes } = updates;
  const { rows } = await query(
    "UPDATE tasks SET title = $1, description = $2, start_date = $3, end_date = $4, time = $5, notes = $6 WHERE id = $7 RETURNING *",
    [title, description, start_date, end_date, time, notes, id]
  );
  return rows[0] || null;
};

/**
 * Delete a task (soft delete).
 * @param {string} id - Task ID.
 * @returns {Promise<boolean>} True if deleted.
 */
const deleteTask = async (id) => {
  const { rowCount } = await query("UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
  return rowCount > 0;
};

module.exports = {
  createTasksTable,
  createTask,
  getTasksByUserId,
  getTaskById,
  markTaskDone,
  editTask,
  deleteTask,
};