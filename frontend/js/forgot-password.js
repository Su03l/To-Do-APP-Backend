document.addEventListener('DOMContentLoaded', () => {
    // Theme Persistence Logic
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.body.classList.add(currentTheme);
    }

    // Forgot Password Form Submission (Placeholder)
    document.getElementById('forgotPasswordForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;

        console.log('Requesting password reset for:', { email });

        try {
            // In a real application, you would send a fetch/axios request to your backend
            // const response = await fetch('/api/forgot-password', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ email }),
            // });

            // const data = await response.json();

            // if (response.ok) {
            //     alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
            //     // Optionally redirect to a confirmation page or login page
            //     window.location.href = 'login.html';
            // } else {
            //     alert(data.message || 'فشل إرسال رابط إعادة التعيين.');
            // }

            // Simulate successful request for now
            alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني (محاكاة)!');
            window.location.href = 'login.html';

        } catch (error) {
            console.error('Error during forgot password request:', error);
            alert('حدث خطأ أثناء طلب إعادة تعيين كلمة المرور. الرجاء المحاولة مرة أخرى.');
        }
    });
});