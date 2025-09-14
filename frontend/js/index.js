document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Hamburger Menu Logic
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-btn');

    function toggleMobileMenu() {
        mobileNav.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    hamburgerMenu.addEventListener('click', toggleMobileMenu);

    overlay.addEventListener('click', toggleMobileMenu);

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Close menu after clicking a link (if it's a scroll link)
            if (link.getAttribute('href').startsWith('#')) {
                toggleMobileMenu();
            }
        });
    });

    // Profile Dropdown Logic (Desktop)
    const profileDropdownToggle = document.querySelector('.profile-dropdown-toggle');
    const profileDropdownMenu = document.querySelector('.profile-dropdown-menu');

    if (profileDropdownToggle) {
        profileDropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from closing immediately
            profileDropdownMenu.classList.toggle('active');
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (e) => {
            if (!profileDropdownToggle.contains(e.target) && !profileDropdownMenu.contains(e.target)) {
                profileDropdownMenu.classList.remove('active');
            }
        });
    }

    // Profile Dropdown Logic (Mobile)
    const mobileProfileDropdownToggle = document.querySelector('.mobile-profile-dropdown-toggle');
    const mobileProfileDropdownMenu = document.querySelector('.mobile-profile-dropdown-menu');

    if (mobileProfileDropdownToggle) {
        mobileProfileDropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileProfileDropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!mobileProfileDropdownToggle.contains(e.target) && !mobileProfileDropdownMenu.contains(e.target)) {
                mobileProfileDropdownMenu.classList.remove('active');
            }
        });
    }

    // Authentication State Management
    const authButtons = document.querySelector('.auth-buttons');
    const profileSection = document.querySelector('.profile-section');
    const mobileAuthButtons = mobileNav.querySelectorAll('.mobile-nav-btn'); // Select login/register buttons in mobile nav
    const mobileProfileSection = document.querySelector('.mobile-profile-section');

    // Placeholder for authentication check
    // In a real application, you would check for a token in localStorage or a cookie
    const isAuthenticated = localStorage.getItem('token') ? true : false; // Example check

    function updateNavbarForAuthStatus() {
        if (isAuthenticated) {
            if (authButtons) authButtons.classList.add('hidden');
            if (profileSection) profileSection.classList.remove('hidden');
            
            // Hide mobile login/register buttons, show mobile profile section
            mobileAuthButtons.forEach(btn => btn.classList.add('hidden'));
            if (mobileProfileSection) mobileProfileSection.classList.remove('hidden');
        } else {
            if (authButtons) authButtons.classList.remove('hidden');
            if (profileSection) profileSection.classList.add('hidden');

            // Show mobile login/register buttons, hide mobile profile section
            mobileAuthButtons.forEach(btn => btn.classList.remove('hidden'));
            if (mobileProfileSection) mobileProfileSection.classList.add('hidden');
        }
    }

    updateNavbarForAuthStatus(); // Call on page load

    // Logout Functionality
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    function handleLogout(e) {
        e.preventDefault();
        // In a real application, you would clear the token from localStorage/cookies
        localStorage.removeItem('token'); 
        // Redirect to login page or home page
        window.location.href = 'login.html'; 
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', handleLogout);
    }
});