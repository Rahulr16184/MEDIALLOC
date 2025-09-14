document.addEventListener('DOMContentLoaded', function() {
    
    // --- Element Selections ---
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const forgotPasswordCard = document.getElementById('forgot-password-card');
    
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginLink = document.getElementById('back-to-login-link');

    // --- Card Switching Logic ---
    function showCard(cardToShow) {
        loginCard.classList.add('d-none');
        registerCard.classList.add('d-none');
        forgotPasswordCard.classList.add('d-none');
        cardToShow.classList.remove('d-none');
    }

    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showCard(registerCard); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showCard(loginCard); });
    forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showCard(forgotPasswordCard); });
    backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showCard(loginCard); });

    // --- Hide/Show Password Logic ---
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');
    togglePasswordIcons.forEach(iconEl => {
        iconEl.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });

    // --- Notification Modal Logic ---
    const notificationModalEl = document.getElementById('notificationModal');
    const notificationModal = new bootstrap.Modal(notificationModalEl);
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalIcon = document.getElementById('modalIcon');
    
    function showNotification(title, message, iconClass = 'fa-circle-check', iconColor = 'var(--success-color)') {
        modalTitle.textContent = title;
        modalBody.textContent = message;
        modalIcon.className = `fas ${iconClass}`;
        modalIcon.style.color = iconColor;
        notificationModal.show();
    }
    
    // --- Form Submission Logic ---
    const patientRegForm = document.getElementById('patient-register-form');
    const hospitalRegForm = document.getElementById('hospital-register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    patientRegForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification(
            'Registration Successful!',
            'A verification link has been sent to your email. Please check your inbox to activate your account.'
        );
        patientRegForm.reset();
    });

    hospitalRegForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification(
            'Hospital Registration Submitted!',
            'Your application has been received. A verification link has been sent to the contact email. You will be notified upon approval.'
        );
        hospitalRegForm.reset();
    });
    
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification(
            'Reset Link Sent',
            'If an account with that email exists, a password reset link has been sent. Please check your inbox.',
            'fa-paper-plane'
        );
        forgotPasswordForm.reset();
        showCard(loginCard); // Return to login screen
    });

});