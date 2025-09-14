document.addEventListener('DOMContentLoaded', function() {
    
    // --- Card Switching Logic ---
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginCard.classList.add('d-none');
        registerCard.classList.remove('d-none');
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerCard.classList.add('d-none');
        loginCard.classList.remove('d-none');
    });

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
    
    // --- Email Verification on Registration Logic ---
    const patientRegForm = document.getElementById('patient-register-form');
    const hospitalRegForm = document.getElementById('hospital-register-form');

    patientRegForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent actual form submission for now
        // ** In a real app, you would submit data to Firebase here. **
        // ** On success from Firebase, you would show this notification. **
        showNotification(
            'Registration Successful!',
            'A verification link has been sent to your email. Please check your inbox to activate your account.'
        );
        patientRegForm.reset(); // Clear the form
    });

    hospitalRegForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent actual form submission for now
        showNotification(
            'Hospital Registration Submitted!',
            'Your application has been received. A verification link has been sent to the contact email. You will be notified upon approval.'
        );
        hospitalRegForm.reset(); // Clear the form
    });

});
