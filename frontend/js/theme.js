document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-checkbox');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'light-theme') {
            if (themeToggle) {
                themeToggle.checked = true;
            }
        }
    } else {
        // Default to dark theme if no theme is set
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
                localStorage.setItem('theme', 'light-theme');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark-theme');
            }
        });
    }
});