const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware"); // Assuming authMiddleware is available

// Get user by ID (protected route)
router.get("/:id", authMiddleware.protect, userController.getUserById);

// Avatar routes
router
  .route("/:id/avatar")
  .put(authMiddleware.protect, (req, res) => {
    userController.updateProfileImage(req, res);
  })
  .delete(authMiddleware.protect, (req, res) => {
    req.body = { profile_image_url: null };
    userController.updateProfileImage(req, res);
  });

// Update user information (protected route)
router.put("/:id", authMiddleware.protect, userController.updateUser);

// Change user password (protected route)
router.put(
  "/:id/password",
  authMiddleware.protect,
  userController.changePassword
);

// Placeholder for other user management routes (create, update, delete)
// router.post('/', authMiddleware, userController.createUser);
// router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
