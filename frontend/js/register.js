document.addEventListener('DOMContentLoaded', () => {
    // Theme Persistence Logic
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.body.classList.add(currentTheme);
    }

    // Show/Hide Password Functionality
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    function setupPasswordToggle(toggleBtn, passwordField) {
        if (toggleBtn && passwordField) {
            toggleBtn.addEventListener('click', function() {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                this.querySelector('i').classList.toggle('fa-eye');
                this.querySelector('i').classList.toggle('fa-eye-slash');
            });
        }
    }

    setupPasswordToggle(togglePassword, passwordInput);
    setupPasswordToggle(toggleConfirmPassword, confirmPasswordInput);

    // Custom Alert Function
    function showAlert(message, type = 'success') {
        const customAlert = document.getElementById('customAlert');
        const alertMessage = document.getElementById('alertMessage');

        if (customAlert && alertMessage) {
            alertMessage.textContent = message;
            customAlert.className = 'custom-alert'; // Reset classes
            customAlert.classList.add(type);
            customAlert.style.display = 'block';

            // Hide after 3 seconds (or adjust as needed)
            setTimeout(() => {
                customAlert.style.display = 'none';
            }, 3000);
        }
    }

    // Register Form Submission
    document.getElementById('registerForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const loader = document.getElementById('loader');

        if (password !== confirmPassword) {
            showAlert('كلمة المرور وتأكيد كلمة المرور غير متطابقين!', 'error');
            return;
        }

        // Basic phone number validation (already handled by pattern in HTML, but good for extra check)
        if (phone && !/^05[0-9]{8}$/.test(phone)) {
            showAlert('صيغة رقم الجوال غير صحيحة. يجب أن يبدأ بـ 05 ويحتوي على 10 أرقام.', 'error');
            return;
        }

        const username = document.getElementById('username').value; // Assuming an input with id="username"

        loader.style.display = 'flex'; // Show loader

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    username: username,
                    email: email,
                    mobile_number: phone,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('تم انشاء الحساب بنجاح يرجلا تسجيل الدخول', 'success');
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setTimeout(() => {
                    window.location.href = 'login.html'; // Redirect to login page
                }, 3000); // 3 seconds
            } else {
                showAlert('خطأ في التسجيل: ' + (data.message || 'حدث خطأ غير معروف.'), 'error');
            }

        } catch (error) {
            console.error('Error during registration:', error);
            showAlert('حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.', 'error');
        } finally {
            loader.style.display = 'none'; // Hide loader
        }
    });
});