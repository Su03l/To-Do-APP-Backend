document.addEventListener('DOMContentLoaded', () => {
    // Theme Persistence Logic
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.body.classList.add(currentTheme);
    }

    // Check for logout success message
    if (localStorage.getItem('logoutSuccess')) {
        showAlert('تم تسجيل خروجك بنجاح', 'success');
        localStorage.removeItem('logoutSuccess'); // Clear the flag
        setTimeout(() => {
            window.location.href = 'login.html'; // Redirect to login.html after 3 seconds
        }, 3000);
    }

    // Show/Hide Password Functionality
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

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

    // Login Form Submission
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const identifier = document.getElementById('identifier').value; // Can be email or username
        const password = document.getElementById('password').value;
        const loader = document.getElementById('loader');

        loader.style.display = 'flex'; // Show loader

        try {
            const response = await fetch('http://localhost:5000/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: identifier,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('تم تسجيل الدخول بنجاح! سيتم توجيهك إلى لوحة التحكم.', 'success');
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setTimeout(() => {
                    window.location.href = 'dashboard.html'; // Redirect to dashboard page
                }, 1000); // Redirect after 1 second
            } else {
                showAlert('خطأ في تسجيل الدخول: ' + (data.message || 'حدث خطأ غير معروف.'), 'error');
            }

        } catch (error) {
            console.error('Error during login:', error);
            showAlert('حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.', 'error');
        } finally {
            loader.style.display = 'none'; // Hide loader
        }
    });
});