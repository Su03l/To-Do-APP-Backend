document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".profile-nav a");
  const profileSections = document.querySelectorAll(".profile-section");
  const togglePasswordIcons = document.querySelectorAll(".toggle-password");
  const profileAvatar = document.getElementById("profileAvatar");
  const avatarUpload = document.getElementById("avatarUpload");
  const showAvatarBtn = document.getElementById("showAvatarBtn");
  const updateAvatarBtn = document.getElementById("updateAvatarBtn");
  const deleteAvatarBtn = document.getElementById("deleteAvatarBtn");
  const avatarModal = document.getElementById("avatarModal");
  const modalAvatar = document.querySelector(".modal-avatar");
  const closeModal = document.querySelector(".close-modal");
  const modalUpdateBtn = document.getElementById("modalUpdateBtn");
  const modalDeleteBtn = document.getElementById("modalDeleteBtn");

  // Input fields
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  // Form
  const profileForm = document.getElementById("profileForm");
  // Removed: const passwordForm = document.getElementById('passwordForm'); // Removed duplicate declaration

  // Default avatar URL
  const DEFAULT_AVATAR_URL =
    "https://images.icon-icons.com/2483/PNG/512/user_icon_149851.png";

  // Custom Alert Function (Copied from login.js)
  function showAlert(message, type = "success") {
    const customAlert = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");

    if (customAlert && alertMessage) {
      alertMessage.textContent = message;
      customAlert.className = "custom-alert"; // Reset classes
      customAlert.classList.add(type);
      customAlert.style.display = "block";

      // Hide after 3 seconds (or adjust as needed)
      setTimeout(() => {
        customAlert.style.display = "none";
      }, 3000);
    }
  }

  // Function to parse JWT token (reused from dashboard.js)
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }

  // Function to fetch user profile (reused from dashboard.js)
  async function fetchUserProfile(userId, token) {
    if (!userId || !token) return null;
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  // Function to convert file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  // Function to update profile image on backend
  async function updateProfileImageOnBackend(userId, token, file) {
    try {
      let profile_image_url = null;

      if (file) {
        // Convert file to base64
        profile_image_url = await fileToBase64(file);
      }

      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/avatar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profile_image_url }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  // Function to update user info on backend
  async function updateUserInfoOnBackend(userId, token, userData) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating user info:", error);
      return null;
    }
  }

  // Function to change password on backend
  async function changePasswordOnBackend(userId, token, passwordData) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passwordData),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error changing password:", error);
      return null;
    }
  }

  // Fetch and populate user profile data on load
  const token = localStorage.getItem("token");
  const decodedToken = token ? parseJwt(token) : null;
  const userId = decodedToken ? decodedToken.id : null;

  if (userId && token) {
    fetchUserProfile(userId, token).then((userProfile) => {
      if (userProfile) {
        if (firstNameInput) firstNameInput.value = userProfile.first_name || "";
        if (lastNameInput) lastNameInput.value = userProfile.last_name || "";
        if (usernameInput) usernameInput.value = userProfile.username || "";
        if (emailInput) emailInput.value = userProfile.email || "";
        if (phoneInput) phoneInput.value = userProfile.mobile_number || "";

        // Update profile avatar
        profileAvatar.src = userProfile.profile_image_url || DEFAULT_AVATAR_URL;
      }
    });
  }

  // Navigation between sections
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const targetId = link.getAttribute("href").substring(1);

      profileSections.forEach((section) => {
        if (section.id === `${targetId}-section`) {
          section.classList.add("active");
        } else {
          section.classList.remove("active");
        }
      });
    });
  });

  // Toggle password visibility
  togglePasswordIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = icon.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      } else {
        input.type = "password";
        icon.classList.add("fa-eye-slash");
        icon.classList.remove("fa-eye");
      }
    });
  });

  // Password change functionality
  const passwordForm = document.getElementById("passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Basic validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert("جميع الحقول مطلوبة", "error");
        return;
      }

      if (newPassword !== confirmPassword) {
        showAlert("كلمة المرور الجديدة وتأكيدها غير متطابقين", "error");
        return;
      }

      // Password strength validation
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        showAlert(
          "كلمة المرور الجديدة يجب أن تحتوي على الأقل على 8 أحرف، حرف كبير، حرف صغير، رقم، وحرف خاص",
          "error"
        );
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}/password`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              currentPassword,
              newPassword,
              confirmNewPassword: confirmPassword,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          showAlert("تم تغيير كلمة المرور بنجاح", "success");
          // Clear the form
          passwordForm.reset();
        } else {
          showAlert(data.message || "فشل تغيير كلمة المرور", "error");
        }
      } catch (error) {
        showAlert("حدث خطأ أثناء تغيير كلمة المرور", "error");
      }
    });
  }

  // Profile form submission
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const userData = {
        first_name: firstNameInput.value,
        last_name: lastNameInput.value,
        username: usernameInput.value,
        email: emailInput.value,
        mobile_number: phoneInput.value,
      };

      try {
        const updatedUser = await updateUserInfoOnBackend(
          userId,
          token,
          userData
        );
        if (updatedUser) {
          showAlert("تم تحديث الملف الشخصي بنجاح!", "success");
          // Optionally re-fetch user profile to ensure UI is fully updated
          fetchUserProfile(userId, token).then((userProfile) => {
            if (userProfile) {
              if (firstNameInput) firstNameInput.value = userProfile.first_name || "";
              if (lastNameInput) lastNameInput.value = userProfile.last_name || "";
              if (usernameInput) usernameInput.value = userProfile.username || "";
              if (emailInput) emailInput.value = userProfile.email || "";
              if (phoneInput) phoneInput.value = userProfile.mobile_number || "";
            }
          });
        } else {
          showAlert("فشل تحديث الملف الشخصي. الرجاء المحاولة مرة أخرى.", "error");
        }
      } catch (error) {
        showAlert("حدث خطأ أثناء تحديث الملف الشخصي.", "error");
      }
    });
  }

  // Avatar functionality
  updateAvatarBtn.addEventListener("click", () => avatarUpload.click());
  modalUpdateBtn.addEventListener("click", () => avatarUpload.click());

  avatarUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showAlert("الرجاء اختيار ملف صورة صالح!", "error");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showAlert("حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت", "error");
        return;
      }

      let tempUrl; // Declare tempUrl outside try-catch
      try {
        // Show loading state
        profileAvatar.style.opacity = "0.5";
        showAlert("جاري تحميل الصورة...", "info");

        // Create temporary preview
        tempUrl = URL.createObjectURL(file);
        profileAvatar.src = tempUrl;
        modalAvatar.src = tempUrl;

        // Upload to server
        if (userId && token) {
          const updatedUser = await updateProfileImageOnBackend(
            userId,
            token,
            file
          );

          if (updatedUser) {
            if (updatedUser.profile_image_url) {
              profileAvatar.src = updatedUser.profile_image_url;
              modalAvatar.src = updatedUser.profile_image_url;
            } else {
              profileAvatar.src = DEFAULT_AVATAR_URL;
              modalAvatar.src = DEFAULT_AVATAR_URL;
            }
            showAlert("تم تحديث صورة الملف الشخصي بنجاح!", "success");
          } else {
            throw new Error("Failed to update profile image");
          }
        }
      } catch (error) {
        showAlert(
          "فشل تحديث صورة الملف الشخصي. الرجاء المحاولة مرة أخرى.",
          "error"
        );

        // Revert to previous avatar
        const currentUserProfile = await fetchUserProfile(userId, token);
        if (currentUserProfile && currentUserProfile.avatar_url) {
          profileAvatar.src = currentUserProfile.avatar_url;
          modalAvatar.src = currentUserProfile.avatar_url;
        }
      } finally {
        // Reset loading state
        profileAvatar.style.opacity = "1";
        // Clean up temporary URL
        URL.revokeObjectURL(tempUrl);
      }
    }
  });

  deleteAvatarBtn.addEventListener("click", async () => {
    // Made async
    // Send request to backend to clear profile image
    if (userId && token) {
      const updatedUser = await updateProfileImageOnBackend(
        userId,
        token,
        null
      ); // Send null to clear image
      if (updatedUser && !updatedUser.profile_image_url) {
        // Check if URL is actually cleared
        profileAvatar.src = DEFAULT_AVATAR_URL; // Update UI
        modalAvatar.src = DEFAULT_AVATAR_URL; // Update UI
        showAlert("تم حذف صورة الملف الشخصي بنجاح!", "success"); // Show success alert
      } else {
        showAlert(
          "فشل حذف صورة الملف الشخصي. الرجاء المحاولة مرة أخرى.",
          "error"
        ); // Show error alert
        // Revert avatar if update failed
        const currentUserProfile = await fetchUserProfile(userId, token);
        profileAvatar.src = currentUserProfile
          ? currentUserProfile.profile_image_url || DEFAULT_AVATAR_URL
          : DEFAULT_AVATAR_URL;
        modalAvatar.src = currentUserProfile
          ? currentUserProfile.profile_image_url || DEFAULT_AVATAR_URL
          : DEFAULT_AVATAR_URL;
      }
    }
  });

  modalDeleteBtn.addEventListener("click", async () => {
    // Made async
    avatarModal.style.display = "none";
    // Send request to backend to clear profile image
    if (userId && token) {
      const updatedUser = await updateProfileImageOnBackend(
        userId,
        token,
        null
      ); // Send null to clear image
      if (updatedUser && !updatedUser.profile_image_url) {
        profileAvatar.src = DEFAULT_AVATAR_URL; // Update UI
        modalAvatar.src = DEFAULT_AVATAR_URL; // Update UI
        showAlert("تم حذف صورة الملف الشخصي بنجاح!", "success"); // Show success alert
      } else {
        showAlert(
          "فشل حذف صورة الملف الشخصي. الرجاء المحاولة مرة أخرى.",
          "error"
        );
        // Revert avatar if update failed
        const currentUserProfile = await fetchUserProfile(userId, token);
        profileAvatar.src = currentUserProfile
          ? currentUserProfile.profile_image_url || DEFAULT_AVATAR_URL
          : DEFAULT_AVATAR_URL;
        modalAvatar.src = currentUserProfile
          ? currentUserProfile.profile_image_url || DEFAULT_AVATAR_URL
          : DEFAULT_AVATAR_URL;
      }
    }
  });

  // Modal functionality
  showAvatarBtn.addEventListener("click", () => {
    modalAvatar.src = profileAvatar.src;
    avatarModal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    avatarModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target == avatarModal) {
      avatarModal.style.display = "none";
    }
  });
});
