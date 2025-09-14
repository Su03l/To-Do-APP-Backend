const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Validate base64 image
function validateBase64Image(base64String) {
  if (!base64String) return true; // null is valid (for clearing image)
  try {
    if (!/^data:image\/(jpeg|jpg|png|gif);base64,/.test(base64String)) {
      return false;
    }
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const fileSize = (base64Data.length * 3) / 4; // Approximate size in bytes
    return fileSize <= 5 * 1024 * 1024; // 5MB limit
  } catch (err) {
    return false;
  }
}

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    console.log(`\n[User Request] GET User By ID: ${req.params.id}`);

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log(`[User Not Found] ID: ${req.params.id}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("\n[User Found] User Details:");
    console.log(JSON.stringify(user, null, 2));

    // Manually exclude password before sending response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.log(`\n[Error] Failed to get user: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile image
exports.updateProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { profile_image_url } = req.body;

    console.log(`\n[Profile Image Update] Requested for User ID: ${id}`);
    console.log(
      `[Profile Image] ${
        profile_image_url ? "New image provided" : "Removing image"
      }`
    );

    // Validate image if one is provided
    if (profile_image_url && !validateBase64Image(profile_image_url)) {
      console.log("[Validation Failed] Invalid image format or size");
      return res.status(400).json({
        message:
          "Invalid image format or size. Must be a valid base64 image under 5MB",
      });
    }

    // Update in database
    const updatedUser = await User.updateProfileImage(id, profile_image_url);
    if (!updatedUser) {
      console.log(`[User Not Found] Failed to update image for ID: ${id}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[Success] Profile image updated");
    console.log("\n[Updated User Details]:");
    console.log(JSON.stringify(updatedUser, null, 2));

    // Return success response
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.log(`\n[Error] Failed to update profile image: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile image
exports.getProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n[Profile Image Request] GET for User ID: ${id}`);

    const profileImageBuffer = await User.getProfileImage(id);
    if (!profileImageBuffer) {
      console.log(`[Not Found] No profile image for User ID: ${id}`);
      return res.status(404).send("No profile image found");
    }

    console.log("[Success] Profile image retrieved");
    const b64 = profileImageBuffer.toString("base64");
    const src = "data:image/png;base64," + b64;

    res.setHeader("Content-Type", "image/png");
    res.send(src);
  } catch (error) {
    console.log(`\n[Error] Failed to get profile image: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user information
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, username, email, mobile_number } = req.body;

    console.log(`\n[User Update] Requested for User ID: ${id}`);
    console.log(
      "[Update Data]:",
      JSON.stringify(
        {
          first_name,
          last_name,
          username,
          email,
          mobile_number,
        },
        null,
        2
      )
    );
    console.log("[Type of ID]:", typeof id);
    console.log("[Request Body]:", req.body);

    const updatedUser = await User.update(id, {
      first_name,
      last_name,
      username,
      email,
      mobile_number,
    });

    if (!updatedUser) {
      console.log(`[User Not Found] Failed to update User ID: ${id}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[Success] User information updated");
    console.log("\n[Updated User Details]:");
    console.log(JSON.stringify(updatedUser, null, 2));

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(`
[Error] Failed to update user: ${error.message}`);
    console.error(error); // Log the full error object
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    console.log(`\n[Password Change] Requested for User ID: ${id}`);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      console.log("[Validation Failed] Missing required password fields");
      return res
        .status(400)
        .json({ message: "All password fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      console.log("[Validation Failed] New passwords do not match");
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    const user = await User.findById(id);
    if (!user) {
      console.log(`[User Not Found] ID: ${id}`);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await User.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      console.log("[Authentication Failed] Incorrect current password");
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.updatePassword(id, hashedNewPassword);

    if (!updatedUser) {
      console.log("[Error] Failed to update password in database");
      return res.status(500).json({ message: "Failed to update password" });
    }

    console.log("[Success] Password updated successfully");
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(`\n[Error] Failed to change password: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};



// Placeholder for other user management functions (create, update, delete)
// exports.createUser = async (req, res) => { ... };
// exports.updateUser = async (req, res) => { ... };
// exports.deleteUser = async (req, res) => { ... };
