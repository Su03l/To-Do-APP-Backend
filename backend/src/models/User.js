const { query } = require("../config");
const bcrypt = require("bcryptjs");

/**
 * @typedef {object} User
 * @property {string} id - User ID
 * @property {string} first_name - User's first name
 * @property {string} last_name - User's last name
 * @property {string} username - User's username
 * @property {string} email - User's email
 * @property {string} mobile_number - User's mobile number
 * @property {string} password - Hashed password
 
 * @property {string} profile_image_url - URL of the user's profile image
 * @property {string} created_at - Timestamp of creation
 */

/**
 * Creates the users table if it doesn't exist.
 */
const createUsersTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile_number VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        profile_image_url TEXT DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Users table created or already exists.");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

/**
 * Finds a user by their email.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<User|null>} The user object or null if not found.
 */
const findByEmail = async (email) => {
  const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] || null;
};

/**
 * Finds a user by their ID.
 * @param {string} id - The ID of the user to find.
 * @returns {Promise<User|null>} The user object or null if not found.
 */
const findById = async (id) => {
  const { rows } = await query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] || null;
};

/**
 * Finds a user by their username.
 * @param {string} username - The username of the user to find.
 * @returns {Promise<User|null>} The user object or null if not found.
 */
const findByUsername = async (username) => {
  const { rows } = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return rows[0] || null;
};

/**
 * Creates a new user.
 * @param {object} userData - The user data.
 * @param {string} userData.first_name - The user's first name.
 * @param {string} userData.last_name - The user's last name.
 * @param {string} userData.username - The user's username.
 * @param {string} userData.email - The user's email.
 * @param {string} userData.mobile_number - The user's mobile number.
 * @param {string} userData.password - The user's plain text password.
 * @returns {Promise<User>} The newly created user object.
 */
const create = async ({
  first_name,
  last_name,
  username,
  email,
  mobile_number,
  password,
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { rows } = await query(
    "INSERT INTO users (first_name, last_name, username, email, mobile_number, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, username, email, mobile_number, created_at",
    [first_name, last_name, username, email, mobile_number, hashedPassword]
  );
  return rows[0];
};

/**
 * Updates a user's profile image.
 * @param {string} id - The ID of the user to update.
 * @param {string|null} profile_image_url - The base64 image data URL or null to clear.
 * @returns {Promise<User|null>} The updated user object or null if not found.
 */
const updateProfileImage = async (id, profile_image_url) => {
  const { rows } = await query(
    "UPDATE users SET profile_image_url = $1 WHERE id = $2 RETURNING id, first_name, last_name, username, email, mobile_number, profile_image_url, created_at",
    [profile_image_url, id]
  );
  return rows[0] || null;
};

/**
 * Retrieves a user's profile image.
 * @param {string} id - The ID of the user.
 * @returns {Promise<Buffer|null>} The profile image buffer or null if not found.
 */
const getProfileImage = async (id) => {
  const { rows } = await query(
    "SELECT profile_image FROM users WHERE id = $1",
    [id]
  );
  return rows[0] ? rows[0].profile_image : null;
};

/**
 * Updates user information.
 * @param {string} id - The ID of the user to update.
 * @param {object} userData - The user data to update.
 * @param {string} [userData.first_name] - The user's first name.
 * @param {string} [userData.last_name] - The user's last name.
 * @param {string} [userData.username] - The user's username.
 * @param {string} [userData.email] - The user's email.
 * @param {string} [userData.mobile_number] - The user's mobile number.
 * @returns {Promise<User|null>} The updated user object or null if not found.
 */
const update = async (
  id,
  { first_name, last_name, username, email, mobile_number }
) => {
  const fields = [];
  const values = [];
  let queryIndex = 1;

  if (first_name !== undefined) {
    fields.push(`first_name = $${queryIndex++}`);
    values.push(first_name);
  }
  if (last_name !== undefined) {
    fields.push(`last_name = $${queryIndex++}`);
    values.push(last_name);
  }
  if (username !== undefined) {
    fields.push(`username = $${queryIndex++}`);
    values.push(username);
  }
  if (email !== undefined) {
    fields.push(`email = $${queryIndex++}`);
    values.push(email);
  }
  if (mobile_number !== undefined) {
    fields.push(`mobile_number = $${queryIndex++}`);
    values.push(mobile_number);
  }

  if (fields.length === 0) {
    return findById(id); // No fields to update, return current user
  }

  values.push(id); // Add ID for WHERE clause

  const setClause = fields.join(", ");
  const { rows } = await query(
    `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING id, first_name, last_name, username, email, mobile_number, profile_image_url, created_at`,
    values
  );
  return rows[0] || null;
};

/**
 * Updates a user's password.
 * @param {string} id - The ID of the user to update.
 * @param {string} newHashedPassword - The new hashed password.
 * @returns {Promise<User|null>} The updated user object or null if not found.
 */
const updatePassword = async (id, newHashedPassword) => {
  const { rows } = await query(
    "UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username, email, created_at",
    [newHashedPassword, id]
  );
  return rows[0] || null;
};

/**
 * Compares a plain text password with a hashed password.
 * @param {string} plainPassword - The plain text password.
 * @param {string} hashedPassword - The hashed password from the database.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  createUsersTable,
  findByEmail,
  findByUsername,
  findById,
  create,
  comparePassword,

  updateProfileImage,
  update,
  updatePassword,
  getProfileImage,
};
